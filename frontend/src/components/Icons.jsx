import {
    FiLock,
    FiCheck,
    FiArrowRight,
    FiSearch,
    FiTerminal,
    FiLogOut,
    FiShield,
    FiCpu,
    FiUsers,
  } from "react-icons/fi";
  
  export function BrandMark({ size = 30 }) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0"
        aria-hidden="true"
      >
        <FiTerminal className="w-4 h-4 text-sky-400" />
      </div>
    );
  }
  
  export function LockIcon({ className = "w-3.5 h-3.5" }) {
    return <FiLock className={className} aria-hidden="true" />;
  }
  
  export function CheckIcon({ className = "w-3.5 h-3.5" }) {
    return <FiCheck className={className} aria-hidden="true" />;
  }
  
  export function ArrowRightIcon({ className = "w-3.5 h-3.5" }) {
    return <FiArrowRight className={className} aria-hidden="true" />;
  }
  
  export function SearchIcon({ className = "w-3.5 h-3.5" }) {
    return <FiSearch className={className} aria-hidden="true" />;
  }
  
  export function LogoutIcon({ className = "w-3.5 h-3.5" }) {
    return <FiLogOut className={className} aria-hidden="true" />;
  }
  
  export function ShieldIcon({ className = "w-4 h-4" }) {
    return <FiShield className={className} aria-hidden="true" />;
  }
  
  export function CpuIcon({ className = "w-4 h-4" }) {
    return <FiCpu className={className} aria-hidden="true" />;
  }
  
  export function UsersIcon({ className = "w-4 h-4" }) {
    return <FiUsers className={className} aria-hidden="true" />;
  }