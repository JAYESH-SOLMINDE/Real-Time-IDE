import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface VoiceUser {
  socketId: string;
  username: string;
  muted: boolean;
  speaking: boolean;
}

export function useVoice(socket: Socket | null, roomId: string, username: string) {
  const [inVoice, setInVoice]       = useState(false);
  const [muted, setMuted]           = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
  const [error, setError]           = useState('');

  const localStream   = useRef<MediaStream | null>(null);
  const peers         = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioRefs     = useRef<Map<string, HTMLAudioElement>>(new Map());
  const speakTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // ── Detect when I am speaking ──
  const startSpeakingDetection = useCallback((stream: MediaStream) => {
    try {
      const audioCtx = new AudioContext();
      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);

      speakTimer.current = setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const isSpeaking = avg > 12;

        setSpeaking(prev => {
          if (prev !== isSpeaking) {
            socket?.emit('voice-speaking', { roomId, speaking: isSpeaking });
          }
          return isSpeaking;
        });
      }, 100);
    } catch (e) {
      console.warn('Speaking detection failed:', e);
    }
  }, [socket, roomId]);

  const stopSpeakingDetection = () => {
    if (speakTimer.current) {
      clearInterval(speakTimer.current);
      speakTimer.current = null;
    }
    analyserRef.current = null;
    setSpeaking(false);
  };

  // ── Create peer connection ──
  const createPeer = useCallback((targetSocketId: string, isInitiator: boolean) => {
    if (!socket || !localStream.current) return null;

    const peer = new RTCPeerConnection(ICE_SERVERS);

    localStream.current.getTracks().forEach(track => {
      peer.addTrack(track, localStream.current!);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('voice-ice', { to: targetSocketId, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      const audio      = new Audio();
      audio.srcObject  = e.streams[0];
      audio.autoplay   = true;
      audioRefs.current.set(targetSocketId, audio);
    };

    peers.current.set(targetSocketId, peer);

    if (isInitiator) {
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        socket.emit('voice-offer', { to: targetSocketId, offer });
      });
    }

    return peer;
  }, [socket]);

  // ── Join Voice ──
  const joinVoice = useCallback(async () => {
  try {
    setError('');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStream.current = stream;
    startSpeakingDetection(stream);
    
    // Small delay to ensure localStream is set before server responds
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setInVoice(true);
    socket?.emit('voice-join', { roomId, username });
  } catch {
    setError('Microphone access denied. Please allow microphone permission.');
  }
}, [socket, roomId, username, startSpeakingDetection]);

  // ── Leave Voice ──
  const leaveVoice = useCallback(() => {
    stopSpeakingDetection();

    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;

    peers.current.forEach(peer => peer.close());
    peers.current.clear();

    audioRefs.current.forEach(audio => {
      audio.srcObject = null;
    });
    audioRefs.current.clear();

    setInVoice(false);
    setVoiceUsers([]);
    setMuted(false);
    setSpeaking(false);
    socket?.emit('voice-leave', { roomId });
  }, [socket, roomId]);

  // ── Toggle Mute ──
  const toggleMute = useCallback(() => {
    if (!localStream.current) return;
    const newMuted = !muted;
    localStream.current.getAudioTracks().forEach(t => {
      t.enabled = !newMuted;
    });
    setMuted(newMuted);
    socket?.emit('voice-mute', { roomId, muted: newMuted });
  }, [muted, socket, roomId]);

  // ── Socket Events ──
  useEffect(() => {
    if (!socket) return;

    socket.on('voice-user-list', ({ socketIds }: { socketIds: string[] }) => {
      socketIds.forEach(sid => createPeer(sid, true));
    });

    socket.on('voice-join', ({ socketId, username: name }: { socketId: string; username: string }) => {
      setVoiceUsers(prev => [
        ...prev.filter(u => u.socketId !== socketId),
        { socketId, username: name, muted: false, speaking: false },
      ]);
      createPeer(socketId, false);
    });

    socket.on('voice-leave', ({ socketId }: { socketId: string }) => {
      peers.current.get(socketId)?.close();
      peers.current.delete(socketId);
      const audio = audioRefs.current.get(socketId);
      if (audio) { audio.srcObject = null; }
      audioRefs.current.delete(socketId);
      setVoiceUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    socket.on('voice-offer', async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      let peer = peers.current.get(from);
      if (!peer) peer = createPeer(from, false) || undefined;
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('voice-answer', { to: from, answer });
    });

    socket.on('voice-answer', async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peers.current.get(from);
      if (peer) await peer.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('voice-ice', async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const peer = peers.current.get(from);
      if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('voice-mute', ({ socketId, muted: isMuted }: { socketId: string; muted: boolean }) => {
      setVoiceUsers(prev =>
        prev.map(u => u.socketId === socketId ? { ...u, muted: isMuted } : u)
      );
    });

    // ── Who is speaking (received from server) ──
    socket.on('voice-speaking', ({ socketId, speaking: isSpeaking }: { socketId: string; speaking: boolean }) => {
      setVoiceUsers(prev =>
        prev.map(u => u.socketId === socketId ? { ...u, speaking: isSpeaking } : u)
      );
    });

    return () => {
      socket.off('voice-user-list');
      socket.off('voice-join');
      socket.off('voice-leave');
      socket.off('voice-offer');
      socket.off('voice-answer');
      socket.off('voice-ice');
      socket.off('voice-mute');
      socket.off('voice-speaking');
    };
  }, [socket, createPeer]);

  useEffect(() => {
    return () => { if (inVoice) leaveVoice(); };
  }, []);

  return { inVoice, muted, speaking, voiceUsers, error, joinVoice, leaveVoice, toggleMute };
}