import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, ShieldCheck, BarChart2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await loginApi(email, password);
      login(user, token);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center relative overflow-hidden selection:bg-accent selection:text-surface-dark">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-8 z-10 p-4">
        <div className="hidden md:flex flex-col justify-center gap-8 p-8">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
              <span className="font-bold text-white text-3xl">G</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">GooPayRecon</h1>
            <p className="text-xl text-gray-400 font-light">Nền tảng đối soát tài chính thông minh, tự động hóa quản lý giao dịch và theo dõi số dư.</p>
          </div>
          
          <div className="flex flex-col gap-6 mt-8">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="p-3 rounded-lg bg-surface-card border border-border-color text-accent"><Zap className="w-6 h-6" /></div>
              <div>
                <h3 className="font-medium text-white text-lg">Tự động hóa</h3>
                <p className="text-sm text-gray-400">Xử lý hàng triệu giao dịch nhanh chóng</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="p-3 rounded-lg bg-surface-card border border-border-color text-blue-400"><BarChart2 className="w-6 h-6" /></div>
              <div>
                <h3 className="font-medium text-white text-lg">Đối soát chính xác</h3>
                <p className="text-sm text-gray-400">Khớp số liệu thời gian thực</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="p-3 rounded-lg bg-surface-card border border-border-color text-purple-400"><ShieldCheck className="w-6 h-6" /></div>
              <div>
                <h3 className="font-medium text-white text-lg">Bảo mật cao</h3>
                <p className="text-sm text-gray-400">Phân quyền chặt chẽ, an toàn dữ liệu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl flex flex-col justify-center animate-fade-in border-t-4 border-t-accent">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <span className="font-bold text-white text-xl">G</span>
            </div>
            <span className="font-bold text-2xl gradient-text">GooPayRecon</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Đăng Nhập</h2>
          <p className="text-gray-400 mb-8">Vui lòng đăng nhập để tiếp tục</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              prefix={<Mail className="w-5 h-5" />}
            />
            
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              prefix={<Lock className="w-5 h-5" />}
              suffix={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none hover:text-accent transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button type="submit" size="lg" loading={loading} className="w-full mt-4 bg-gradient-to-r from-primary to-primary-light border-none shadow-lg shadow-primary/20 hover:shadow-primary/40">
              Đăng Nhập
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500 bg-black/20 p-4 rounded-lg border border-border-color">
            <p className="mb-2 font-medium text-gray-400">Tài khoản Demo:</p>
            <p className="font-mono">Admin: admin@goopayrecon.com / <span className="text-accent">Admin123!</span></p>
            <p className="font-mono">Editor: editor@goopayrecon.com / <span className="text-accent">Editor123!</span></p>
            <p className="font-mono">Viewer: viewer@goopayrecon.com / <span className="text-accent">Viewer123!</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
