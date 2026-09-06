'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check, Download, Video, ExternalLink, MapPin, Sparkles, Key, Lock, Unlock, RotateCcw, FileText, Share2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const MeetingScheduler: React.FC = () => {
  const [title, setTitle, resetTitle] = useLocalStorage<string>('toolip_meet_title', 'Toolip Project Sync Meeting');
  const [description, setDescription, resetDescription] = useLocalStorage<string>(
    'toolip_meet_desc',
    'Discuss upcoming tool enhancements and review completed context tags.'
  );
  const [date, setDate, resetDate] = useLocalStorage<string>('toolip_meet_date', '2026-09-10');
  const [startTime, setStartTime, resetStartTime] = useLocalStorage<string>('toolip_meet_startTime', '14:00');
  const [endTime, setEndTime, resetEndTime] = useLocalStorage<string>('toolip_meet_endTime', '15:00');
  const [location, setLocation, resetLocation] = useLocalStorage<string>('toolip_meet_location', 'Conference Room A');
  const [videoLink, setVideoLink, resetVideoLink] = useLocalStorage<string>('toolip_meet_videoLink', 'https://meet.google.com/abc-defg-hij');

  // Passcode Security Toggle State
  const [hasPassword, setHasPassword] = useLocalStorage<boolean>('toolip_meet_hasPass', true);
  const [meetingPassword, setMeetingPassword, resetMeetingPassword] = useLocalStorage<string>('toolip_meet_pass', '123456');

  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const resetAllMeeting = () => {
    resetTitle();
    resetDescription();
    resetDate();
    resetStartTime();
    resetEndTime();
    resetLocation();
    resetVideoLink();
    resetMeetingPassword();
  };

  // Format Date for display (e.g. Thursday, Sep 10, 2026)
  const getFormattedDateStr = () => {
    try {
      const d = new Date(`${date}T${startTime}`);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return date;
    }
  };

  // Format 12-hour time (e.g. 02:00 PM)
  const format12Hour = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const formattedH = (h % 12 || 12).toString().padStart(2, '0');
      return `${formattedH}:${m.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Standard Compliant .ICS Calendar Generator
  const generateIcs = () => {
    const startIso = `${date.replace(/-/g, '')}T${startTime.replace(':', '')}00`;
    const endIso = `${date.replace(/-/g, '')}T${endTime.replace(':', '')}00`;
    const uid = `meeting_${Date.now()}@toolip.app`;

    let locationCombined = videoLink
      ? `${location} | Video Link: ${videoLink}`
      : location;

    if (hasPassword && meetingPassword) {
      locationCombined += ` | Passcode: ${meetingPassword}`;
    }

    const fullDesc = hasPassword && meetingPassword
      ? `${description}\nPasscode: ${meetingPassword}`
      : description;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Toolip//Meeting Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${fullDesc.replace(/\n/g, '\\n')}`,
      `LOCATION:${locationCombined}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.ics`;
    a.click();
  };

  // Formatted Group Chat Invitation Message Copy (WhatsApp / Slack / Teams)
  const copyFormattedGroupChatInvite = () => {
    const dateFormatted = getFormattedDateStr();
    const startFormatted = format12Hour(startTime);
    const endFormatted = format12Hour(endTime);

    const passwordLine = hasPassword && meetingPassword ? `\n🔑 Meeting Passcode: ${meetingPassword}` : '';

    const inviteMsg = `📅 MEETING INVITATION: ${title}
--------------------------------------------------
📌 Agenda: ${description}
🗓 Date: ${dateFormatted}
⏰ Time: ${startFormatted} - ${endFormatted}
📍 Location: ${location || 'N/A'}
🔗 Video Link: ${videoLink || 'N/A'}${passwordLine}
--------------------------------------------------
Generated via Toolip Meeting Scheduler`;

    navigator.clipboard.writeText(inviteMsg);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const openGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const openZoom = () => {
    window.open('https://zoom.us/start/videomeeting', '_blank');
  };

  const openSlack = () => {
    window.open('https://slack.com', '_blank');
  };

  const openSkype = () => {
    window.open('https://join.skype.com/launch/', '_blank');
  };

  const openDiscord = () => {
    window.open('https://discord.com/app', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Platform Quick Launcher Header Bar */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center space-x-2 text-white font-bold tracking-wide">
            <Video className="h-5 w-5 text-sky-400" />
            <span>Launch Video Meeting Platform:</span>
          </span>

          <button
            onClick={resetAllMeeting}
            title="Reset meeting details to defaults"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-gray-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openGoogleMeet}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <span>Google Meet</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={openZoom}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
          >
            <span>Zoom</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={openSlack}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
          >
            <span>Slack Huddle</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={openSkype}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all hover:scale-105"
          >
            <span>Skype</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={openDiscord}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <span>Discord</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Upgraded Form Card (Increased Font Sizes) */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5 backdrop-blur-xl shadow-xl">
        <div className="text-sm font-bold text-sky-400 uppercase tracking-widest flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-sky-400" />
          <span>Meeting Specification & Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Meeting Title Input */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-gray-200 block">Meeting Title / Topic:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Product Roadmap & Architecture Sync..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Physical Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-rose-400" />
              <span>Location / Room:</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Conference Room A or Main Office..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
            />
          </div>

          {/* Video Call URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
              <Video className="h-4 w-4 text-sky-400" />
              <span>Video Meeting Link:</span>
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="e.g. https://meet.google.com/abc-defg-hij..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono font-bold text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
            />
          </div>

          {/* Password Security Card */}
          <div className="md:col-span-1 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-200 flex items-center space-x-2 cursor-pointer">
                <Key className="h-4 w-4 text-amber-400" />
                <span>Require Passcode / Security PIN</span>
              </label>
              <button
                onClick={() => setHasPassword(!hasPassword)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasPassword ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasPassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {hasPassword && (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Enter passcode (e.g. 123456)..."
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Date Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Meeting Date:</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
            />
          </div>

          {/* Time Picker Controls */}
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Start Time:</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-rose-400" />
                <span>End Time:</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
              />
            </div>
          </div>

          {/* Description / Agenda */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-gray-200 flex items-center space-x-1.5">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Agenda / Notes:</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add agenda items, goals, or meeting expectations..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Formatted Business Group Chat Preview Card */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl shadow-xl">
        <div className="flex justify-between items-center text-sm font-bold text-gray-300">
          <span className="flex items-center space-x-2">
            <Share2 className="h-4 w-4 text-sky-400" />
            <span>Formatted Group Chat Invite Preview:</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-bold border border-sky-500/30">
            WhatsApp • Slack • Teams
          </span>
        </div>
        <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl font-mono text-sm text-sky-200 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
          {`📅 MEETING INVITATION: ${title}
--------------------------------------------------
📌 Agenda: ${description}
🗓 Date: ${getFormattedDateStr()}
⏰ Time: ${format12Hour(startTime)} - ${format12Hour(endTime)}
📍 Location: ${location || 'N/A'}
🔗 Video Link: ${videoLink || 'N/A'}${hasPassword && meetingPassword ? `\n🔑 Meeting Passcode: ${meetingPassword}` : ''}
--------------------------------------------------`}
        </pre>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={generateIcs}
          className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105"
        >
          <Download className="h-5 w-5" />
          <span>Download Standard .ICS Calendar File</span>
        </button>

        <button
          onClick={copyFormattedGroupChatInvite}
          className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
        >
          {copiedInvite ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          <span>{copiedInvite ? 'Copied Invitation!' : 'Copy Formatted Group Chat Invite'}</span>
        </button>
      </div>
    </div>
  );
};
