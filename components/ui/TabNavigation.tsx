import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface Tab<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabNavigationProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function TabNavigation<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps<T>) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-700/50 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all',
                {
                  'bg-primary-600 text-white': activeTab === tab.id,
                  'text-gray-400 hover:text-white': activeTab !== tab.id,
                }
              )}
            >
              {tab.icon && <span className="inline-block mr-1">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
