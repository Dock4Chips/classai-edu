'use client';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 登录成功！
                </h1>
                <p className="text-gray-600 text-lg">
                    欢迎使用 ClassAI 管理系统
                </p>
            </div>
        </div>
    );
}