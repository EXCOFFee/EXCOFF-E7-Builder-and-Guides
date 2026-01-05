import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

interface HeroSkill {
    name: string;
    icon: string;
    description?: string;
}

interface SkillUpgradeInputProps {
    skillNumber: 1 | 2 | 3;
    skillData: HeroSkill | undefined;
    value: number;
    onChange: (value: number) => void;
}

export function SkillUpgradeInput({
    skillNumber,
    skillData,
    value,
    onChange
}: SkillUpgradeInputProps) {
    const { t } = useTranslations();

    if (!skillData) return null;

    return (
        <div className={`
            relative group p-4 rounded-xl border transition-all duration-300
            ${value > 0
                ? 'bg-gradient-to-br from-e7-gold/20 to-e7-text-gold/10 border-e7-gold/50 shadow-lg shadow-e7-gold/10'
                : 'bg-e7-panel border-white/5 hover:border-white/10'
            }
        `}>
            {/* Skill Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 shrink-0">
                    <div className={`absolute inset-0 rounded-lg blur-md transition-opacity duration-300 ${value > 0 ? 'bg-e7-gold/30 opacity-100' : 'opacity-0'}`}></div>
                    <Image
                        src={skillData.icon}
                        alt={skillData.name}
                        width={56}
                        height={56}
                        className={`
                            relative z-10 w-full h-full rounded-lg border-2 transition-colors duration-300
                            ${value > 0 ? 'border-e7-gold' : 'border-white/20'}
                        `}
                        unoptimized
                    />
                    <div className="absolute -bottom-2 -right-2 z-20 bg-e7-void border border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400">
                        S{skillNumber}
                    </div>
                </div>

                <div className="min-w-0">
                    <h4 className={`font-bold truncate transition-colors ${value > 0 ? 'text-e7-gold' : 'text-gray-300'}`}>
                        {skillData.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {t('builds.upgradeLevel', 'Upgrade Level')}
                    </p>
                </div>
            </div>

            {/* Level Selector */}
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className={`
                        w-full appearance-none rounded-lg px-4 py-2.5 text-sm font-medium
                        border transition-all cursor-pointer outline-none focus:ring-2
                        ${value > 0
                            ? 'bg-e7-void/50 border-e7-gold/30 text-e7-gold focus:ring-e7-gold/50'
                            : 'bg-e7-void border-white/10 text-gray-400 focus:ring-white/20'
                        }
                    `}
                >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(level => (
                        <option key={level} value={level}>
                            {level === 0 ? t('common.none', 'None (+0)') : `+${level}`}
                        </option>
                    ))}
                </select>

                {/* Custom Chevron */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-colors ${value > 0 ? 'text-e7-gold' : 'text-gray-500'}`}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
