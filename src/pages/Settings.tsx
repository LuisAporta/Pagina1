import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun } from 'lucide-react';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>

            <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {/* Language Settings */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Globe className="h-5 w-5 mr-2 text-indigo-500" />
                            {t('language')}
                        </h3>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-4 py-2 rounded-md ${i18n.language === 'en'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t('english')}
                        </button>
                        <button
                            onClick={() => changeLanguage('es')}
                            className={`px-4 py-2 rounded-md ${i18n.language === 'es'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t('spanish')}
                        </button>
                    </div>
                </div>

                {/* Theme Settings (Stub for now) */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Sun className="h-5 w-5 mr-2 text-orange-500" />
                            {t('theme')}
                        </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                        Theme switching coming soon. Currently using System/Light mode.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
