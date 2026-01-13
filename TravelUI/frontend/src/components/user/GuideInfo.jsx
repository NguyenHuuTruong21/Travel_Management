import React from 'react';
import { FiUser, FiAward, FiGlobe, FiBriefcase } from 'react-icons/fi';

const GuideInfo = ({ guide }) => {
    // Only show if guide exists and is active
    if (!guide || guide.status !== 'active') {
        return null;
    }

    const avatarUrl = guide.avatar?.startsWith('http')
        ? guide.avatar
        : `http://localhost:5000${guide.avatar?.startsWith('/') ? '' : '/'}${guide.avatar?.replace(/\\/g, '/')}`;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Hướng dẫn viên
            </h3>

            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt={guide.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(guide.name) + '&background=3b82f6&color=fff';
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{guide.name}</h4>

                    {/* Experience */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FiAward className="text-yellow-500" />
                        <span>{guide.experience} năm kinh nghiệm</span>
                    </div>

                    {/* Tours Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FiBriefcase className="text-green-500" />
                        <span>Đã dẫn {guide.toursCount || 0} tour</span>
                    </div>

                    {/* Languages */}
                    {guide.languages && guide.languages.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                            <FiGlobe className="text-blue-500 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                                {guide.languages.map((lang, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {guide.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {guide.description}
                        </p>
                    )}

                    {/* Certificates */}
                    {guide.certificates && guide.certificates.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Chứng chỉ:</p>
                            <div className="flex flex-wrap gap-1">
                                {guide.certificates.map((cert, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                                    >
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuideInfo;
