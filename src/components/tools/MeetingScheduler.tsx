'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check, Download, Video, ExternalLink, MapPin, Sparkles, Key, Lock, Unlock, RotateCcw } from 'lucide-react';
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
      {/* Platform Quick Launcher Buttons */}
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center space-x-2 text-gray-300 font-semibold">
            <Video className="h-4 w-4 text-sky-400" />
            <span>Launch Video Meeting Platform:</span>
          </span>

          <button
            onClick={resetAllMeeting}
            title="Reset meeting details to defaults"
            className="flex items-center space-x-1 px-2.5 py-1 bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-rose-400 rounded-lg text-[11px] font-semibold transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openGoogleMeet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Google Meet</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={openZoom}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Zoom</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={openSlack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Slack Huddle</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={openSkype}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Skype</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={openDiscord}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>Discord</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Meeting Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5 text-rose-400" />
            <span>Physical Location / Room:</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Conference Room A or Office 3rd Floor..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <Video className="h-3.5 w-3.5 text-sky-400" />
            <span>Video Call URL / Link:</span>
          </label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="e.g. https://meet.google.com/abc-defg-hij..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-sky-300 font-mono focus:outline-none"
          />
        </div>

        {/* Password Security Toggle Switch */}
        <div className="sm:col-span-1 p-3 bg-gray-950 border border-gray-800/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300 flex items-center space-x-2 cursor-pointer">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Require Meeting Passcode / Password</span>
            </label>
            <button
              onClick={() => setHasPassword(!hasPassword)}
              className={`relative inline-flex h-2 w-9 items-center rounded-full transition-colors ${hasPassword ? 'bg-amber-500' : 'bg-gray-800'
                }`}
            >
              <span
                className={`inline-block h-4 w-2 transform rounded-full bg-white transition-transform ${hasPassword ? 'translate-x-7' : 'translate-x-1'
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
                placeholder="Enter meeting passcode (e.g. 123456)..."
                className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Meeting Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-300">Agenda / Notes:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Formatted Group Chat Preview Card */}
      <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
          <span>Formatted Business Group Chat Preview:</span>
          <span className="text-[10px] text-sky-400">Ready for WhatsApp / Slack / Teams</span>
        </div>
        <pre className="p-3 bg-gray-900 rounded-lg font-mono text-xs text-sky-200 overflow-x-auto whitespace-pre-wrap">
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
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={generateIcs}
          className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download Standard .ICS Calendar File</span>
        </button>

        <button
          onClick={copyFormattedGroupChatInvite}
          className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
        >
          {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copiedInvite ? 'Copied Invitation!' : 'Copy Formatted Group Chat Invite'}</span>
        </button>
      </div>
    </div>
  );
};
