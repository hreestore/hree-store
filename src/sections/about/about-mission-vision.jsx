import { motion } from 'motion/react';
import { Target, Eye } from 'lucide-react';
import { Iconify } from '@/components/iconify';

export default function AboutMissionVision({ aboutData }) {

    const { mission_visions } = aboutData || {};
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Mission */}
                {mission_visions?.map((mission, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        className={`p-10 lg:p-14 rounded-[3rem] relative overflow-hidden group transition-all duration-500 ${index === 0
                            ? 'bg-[#081a1a] text-[#ffffff] shadow-2xl hover:-translate-y-2'
                            : 'bg-[#f2f2f2] text-[#081a1a] shadow-sm hover:shadow-xl'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 text-[#ffffff] ${index === 0 ? 'bg-[#711a20]' : 'bg-[#081a1a]'
                            }`}>
                            <Iconify icon={mission.icon} width={32} />
                        </div>
                        <h2 className={`text-4xl lg:text-5xl font-display font-black uppercase tracking-tighter mb-6 ${index === 0 ? 'text-[#ffffff]' : 'text-[#081a1a]'
                            }`}>
                            {mission.title}
                        </h2>
                        <p className={`text-lg font-medium leading-relaxed ${index === 0 ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            {mission.description}
                        </p>
                    </motion.div>
                ))}
                {/* Vision */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="p-10 lg:p-14 bg-[#081a1a] text-[#ffffff] rounded-[3rem] shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500"
                >
                    <div className="w-16 h-16 bg-[#ffffff] text-[#081a1a] rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Eye className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tighter mb-6">
                        Our <span className="text-[#711a20]">Vision</span>
                    </h2>
                    <p className="text-gray-300 text-lg font-medium leading-relaxed">
                        To become the leading global destination for custom fashion, where innovation in design and sustainable manufacturing practices redefine how people create, wear, and experience customized clothing.
                    </p>
                </motion.div> */}
            </div>
        </section>
    );
}