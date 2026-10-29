/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MangoIconProps {
  className?: string;
}

export const MangoIcon: React.FC<MangoIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <img
      src="/assets/aistudio/628d4d84-9eaf-40c1-8d4e-0834f06a7a8d_b9ee2db4.jpg"
      alt="Plotty Mango Character Logo"
      className={`${className} object-cover rounded-xl shadow-2xs`}
    />
  );
};
