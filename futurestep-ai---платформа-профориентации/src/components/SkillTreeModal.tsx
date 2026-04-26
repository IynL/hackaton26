import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Info } from 'lucide-react';
import * as d3 from 'd3';
import { getSkillTree } from '../services/geminiService';
import { useTranslation } from '../lib/i18n';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profession: string;
}

export default function SkillTreeModal({ isOpen, onClose, profession }: SkillTreeModalProps) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && profession) {
      loadData();
    }
  }, [isOpen, profession]);

  const loadData = async () => {
    setLoading(true);
    const treeData = await getSkillTree(profession);
    setData(treeData);
    setLoading(false);
  };

  useEffect(() => {
    if (data && svgRef.current && !loading) {
      renderTree();
    }
  }, [data, loading]);

  const renderTree = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 100, bottom: 50, left: 100 };

    // Grouping nodes into hierarchy
    const rootNode = data.nodes.find((n: any) => n.parentId === null);
    if (!rootNode) return;

    const findChildren = (parentId: string): any => {
      return data.nodes
        .filter((n: any) => n.parentId === parentId)
        .map((n: any) => ({
          ...n,
          children: findChildren(n.id)
        }));
    };

    const treeDataHierarchy: any = {
      ...rootNode,
      children: findChildren(rootNode.id)
    };

    const root = d3.hierarchy(treeDataHierarchy);
    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    treeLayout(root);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x) as any);

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => d.depth === 0 ? '#fff' : '#666');

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.children ? -10 : 10)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.label)
      .attr('fill', '#999')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '1px');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-claude-surface border border-claude-border rounded-[2rem] w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-claude-border flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{profession}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('skill_tree_sync')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-claude-bg relative flex items-center justify-center p-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{t('skill_tree_compiling')}</p>
            </div>
          ) : (
            <div className="w-full h-full flex justify-center">
              <svg 
                ref={svgRef} 
                width="800" 
                height="600" 
                className="max-w-full h-auto"
                viewBox="0 0 800 600"
              />
            </div>
          )}

          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-claude-surface border border-claude-border p-3 rounded-xl">
             <Info className="w-4 h-4 text-gray-500" />
             <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{t('skill_tree_standard')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
