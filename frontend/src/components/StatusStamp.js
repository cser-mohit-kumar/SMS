import React from 'react';
import { Clock, CheckCircle2, XCircle, PackageCheck } from 'lucide-react';

const CONFIG = {
  PENDING: { className: 'stamp-pending', Icon: Clock, label: 'Pending' },
  APPROVED: { className: 'stamp-approved', Icon: CheckCircle2, label: 'Approved' },
  REJECTED: { className: 'stamp-rejected', Icon: XCircle, label: 'Rejected' },
  FULFILLED: { className: 'stamp-fulfilled', Icon: PackageCheck, label: 'Fulfilled' },
};

const StatusStamp = ({ status }) => {
  const config = CONFIG[status] || { className: '', Icon: Clock, label: status || 'Unknown' };
  const { className, Icon, label } = config;

  return (
    <span className={`stamp ${className}`}>
      <Icon /> {label}
    </span>
  );
};

export default StatusStamp;
