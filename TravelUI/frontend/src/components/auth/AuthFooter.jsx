import { Link } from 'react-router-dom';

const AuthFooter = ({ isLogin }) => (
  <div className="mt-6 text-center border-t border-gray-200 pt-6">
    {isLogin ? (
      <p className="text-sm text-gray-600">
        Chưa là thành viên?{' '}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    ) : (
      <p className="text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </p>
    )}
  </div>
);

export default AuthFooter;
