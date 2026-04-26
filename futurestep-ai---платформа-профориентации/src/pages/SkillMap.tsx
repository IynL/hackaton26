import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Search, Loader2, Info } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getSkillTree } from '../services/geminiService';
import * as d3 from 'd3';

export default function SkillMap() {
  const { t } = useTranslation();
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any>(null);
  const d3Container = React.useRef(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession.trim()) return;
    setLoading(true);
    const data = await getSkillTree(profession);
    setTreeData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (treeData && d3Container.current) {
      renderTree();
    }
  }, [treeData]);

  const renderTree = () => {
    const svg = d3.select(d3Container.current);
    svg.selectAll('*').remove();

    const width = 1000;
    const height = 800;
    const margin = { top: 40, right: 90, bottom: 40, left: 90 };

    const rootNode = treeData.nodes.find((n: any) => n.parentId === null);
    if (!rootNode) return;

    const findChildren = (parentId: string): any => {
      return treeData.nodes
        .filter((n: any) => n.parentId === parentId)
        .map((n: any) => ({
          ...n,
          children: findChildren(n.id)
        }));
    };

    const hierarchyData: any = {
      ...rootNode,
      children: findChildren(rootNode.id)
    };

    const root = d3.hierarchy(hierarchyData);
    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    treeLayout(root);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('d', d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x) as any);

    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 6)
      .attr('fill', (d: any) => d.depth === 0 ? '#fff' : '#444')
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.label)
      .attr('fill', '#bbb')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '1px')
      .style('pointer-events', 'none');
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <span className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('skill_map_system')}</span>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('skill_map_title')}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm font-medium">
          {t('skill_map_desc')}
        </p>
      </div>

      <div className="bg-claude-surface rounded-2xl border border-claude-border p-6 mb-12 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder={t('skill_map_placeholder')}
              className="w-full pl-10 pr-4 py-3 bg-claude-bg border border-claude-border rounded-xl focus:ring-1 focus:ring-gray-600 outline-none text-sm font-medium text-white"
            />
          </div>
          <button
            disabled={loading}
            className="bg-white text-claude-bg px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {t('skill_map_btn')}
          </button>
        </form>
      </div>

      <div className="bg-claude-surface rounded-3xl border border-claude-border p-8 overflow-hidden min-h-[600px] flex items-center justify-center relative">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 text-gray-700 animate-spin" />
             <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-widest">Compiling Skill Logic...</p>
          </div>
        ) : treeData ? (
          <div className="w-full overflow-x-auto">
            <svg
              ref={d3Container}
              width="1000"
              height="800"
              className="mx-auto"
            />
          </div>
        ) : (
          <div className="text-center text-gray-700 uppercase font-black text-2xl opacity-10 pointer-events-none">
            {t('skill_map_dashboard')}
          </div>
        )}
        
        <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-claude-bg/50 border border-claude-border p-3 rounded-xl backdrop-blur-sm">
           <Info className="w-4 h-4 text-gray-500" />
           <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{t('skill_map_service_active')}</p>
        </div>
      </div>
    </div>
  );
}
