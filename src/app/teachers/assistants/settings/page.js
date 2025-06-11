'use client';

import Image from 'next/image';
import { useState } from 'react';
import './styles/page.css';
import AccountSettings from './components/script';

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Account Settings</h1>
      
      <div className="settings-content">
        <div className="settings-main">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}
