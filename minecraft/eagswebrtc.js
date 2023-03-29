window.initializeVoiceClient = () => {
    class k {
        constructor(a, b, c, f) {
            this.client = a; this.peerId = b; this.peerConnection = c; this.stream = null; const e = this; this.peerConnection.addEventListener("icecandidate", g => { g.candidate && e.client.iceCandidateHandler(e.peerId, JSON.stringify({ sdpMLineIndex: g.candidate.sdpMLineIndex, candidate: g.candidate.candidate })) }); this.peerConnection.addEventListener("track", g => {
                e.rawStream = g.streams[0]; const h = new Audio; h.autoplay = !0; h.muted = !0; h.onended = function () { h.remove() }; h.srcObject =
                    e.rawStream; e.client.peerTrackHandler(e.peerId, e.rawStream)
            }); this.peerConnection.addStream(this.client.localMediaStream.stream); f && this.peerConnection.createOffer(g => { e.peerConnection.setLocalDescription(g, () => { e.client.descriptionHandler(e.peerId, JSON.stringify(g)); 1 != e.client.peerStateInitial && (e.client.peerStateInitial = 1) }, h => { console.error('Failed to set local description for "' + e.peerId + '"! ' + h); 2 == e.client.peerStateInitial && (e.client.peerStateInitial = 0); e.client.signalDisconnect(e.peerId) }) },
                g => { console.error('Failed to set create offer for "' + e.peerId + '"! ' + g); 2 == e.client.peerStateInitial && (e.client.peerStateInitial = 0); e.client.signalDisconnect(e.peerId) }); this.peerConnection.addEventListener("connectionstatechange", g => {
                    "disconnected" === e.peerConnection.connectionState ? e.client.signalDisconnect(e.peerId) : "connected" === e.peerConnection.connectionState ? 1 != e.client.peerState && (e.client.peerState = 1) : "failed" === e.peerConnection.connectionState && (2 == e.client.peerState && (e.client.peerState =
                        0), e.client.signalDisconnect(e.peerId))
                })
        } disconnect() { this.peerConnection.close() } mute(a) { this.rawStream.getAudioTracks()[0].enabled = !a } setRemoteDescription(a) {
            const b = this; try {
                const c = JSON.parse(a); this.peerConnection.setRemoteDescription(c, () => {
                    "offer" == c.type && b.peerConnection.createAnswer(f => {
                        b.peerConnection.setLocalDescription(f, () => { b.client.descriptionHandler(b.peerId, JSON.stringify(f)); 1 != b.client.peerStateDesc && (b.client.peerStateDesc = 1) }, e => {
                            console.error('Failed to set local description for "' +
                                b.peerId + '"! ' + e); 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0); b.client.signalDisconnect(b.peerId)
                        })
                    }, f => { console.error('Failed to create answer for "' + b.peerId + '"! ' + f); 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0); b.client.signalDisconnect(b.peerId) })
                }, f => { console.error('Failed to set remote description for "' + b.peerId + '"! ' + f); 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0); b.client.signalDisconnect(b.peerId) })
            } catch (c) {
                console.error('Failed to parse remote description for "' +
                    b.peerId + '"! ' + c), 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0), b.client.signalDisconnect(b.peerId)
            }
        } addICECandidate(a) { try { this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(a))), 1 != this.client.peerStateIce && (this.client.peerStateIce = 1) } catch (b) { console.error('Failed to parse ice candidate for "' + this.peerId + '"! ' + b), 2 == this.client.peerStateIce && (this.client.peerStateIce = 0), this.client.signalDisconnect(this.peerId) } }
    } class d {
        constructor() {
            this.ICEServers = []; this.hasInit = !1;
            this.peerList = new Map; this.readyState = 0; this.peerStateIce = this.peerStateDesc = this.peerStateInitial = this.peerStateConnect = this.peerState = 2; this.microphoneVolumeAudioContext = this.peerDisconnectHandler = this.peerTrackHandler = this.descriptionHandler = this.iceCandidateHandler = null
        } voiceClientSupported() { return "undefined" !== typeof window.RTCPeerConnection && "undefined" !== typeof navigator.mediaDevices && "undefined" !== typeof navigator.mediaDevices.getUserMedia } setICEServers(a) {
            for (var b = this.ICEServers.length =
                0; b < a.length; ++b) { var c = a[b].split(";"); 1 == c.length ? this.ICEServers.push({ urls: c[0] }) : 3 == c.length && this.ICEServers.push({ urls: c[0], username: c[1], credential: c[2] }) }
        } setICECandidateHandler(a) { this.iceCandidateHandler = a } setDescriptionHandler(a) { this.descriptionHandler = a } setPeerTrackHandler(a) { this.peerTrackHandler = a } setPeerDisconnectHandler(a) { this.peerDisconnectHandler = a } activateVoice(a) { this.hasInit && (this.localRawMediaStream.getAudioTracks()[0].enabled = a) } initializeDevices() {
            if (this.hasInit) this.readyState =
                1; else {
                    const a = this; navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }).then(b => {
                        a.microphoneVolumeAudioContext = new AudioContext; a.localRawMediaStream = b; a.localRawMediaStream.getAudioTracks()[0].enabled = !1; a.localMediaStream = a.microphoneVolumeAudioContext.createMediaStreamDestination(); a.localMediaStreamGain = a.microphoneVolumeAudioContext.createGain(); a.microphoneVolumeAudioContext.createMediaStreamSource(b).connect(a.localMediaStreamGain); a.localMediaStreamGain.connect(a.localMediaStream); a.localMediaStreamGain.gain.value =
                            1; a.readyState = 1; this.hasInit = !0
                    }).catch(b => { a.readyState = -1 })
            }
        } setMicVolume(a) { this.hasInit && (.5 < a && (a = .5 + 2 * (a - .5)), 1.5 < a && (a = 1.5), 0 > a && (a = 0), this.localMediaStreamGain.gain.value = 2 * a) } resetPeerStates() { this.peerState = this.peerStateConnect = this.peerStateInitial = this.peerStateDesc = this.peerStateIce = 2 } getPeerState() { return this.peerState } getPeerStateConnect() { return this.peerStateConnect } getPeerStateInitial() { return this.peerStateInitial } getPeerStateDesc() { return this.peerStateDesc } getPeerStateIce() { return this.peerStateIce } getReadyState() { return this.readyState } signalConnect(a,
            b) { this.hasInit || this.initializeDevices(); try { const c = new RTCPeerConnection({ iceServers: this.ICEServers, optional: [{ DtlsSrtpKeyAgreement: !0 }] }), f = new k(this, a, c, b); this.peerList.set(a, f); 1 != this.peerStateConnect && (this.peerStateConnect = 1) } catch (c) { 2 == this.peerStateConnect && (this.peerStateConnect = 0) } } signalDescription(a, b) { a = this.peerList.get(a); "undefined" !== typeof a && null !== a && a.setRemoteDescription(b) } signalDisconnect(a, b) {
                var c = this.peerList.get(a); if ("undefined" !== typeof c && null !== c) {
                    this.peerList.delete(c);
                    try { c.disconnect() } catch (f) { } this.peerDisconnectHandler(a, b)
                }
            } mutePeer(a, b) { a = this.peerList.get(a); "undefined" !== typeof a && null !== a && a.mute(b) } signalICECandidate(a, b) { a = this.peerList.get(a); "undefined" !== typeof a && null !== a && a.addICECandidate(b) }
    } window.constructVoiceClient = () => new d
}; window.startVoiceClient = () => { "function" !== typeof window.constructVoiceClient && window.initializeVoiceClient(); return window.constructVoiceClient() };
window.initializeLANClient = () => {
    class k {
        constructor() { this.ICEServers = []; this.dataChannel = this.peerConnection = null; this.readyState = 1; this.remotePacketHandler = this.remoteDisconnectHandler = this.remoteDataChannelHandler = this.descriptionHandler = this.iceCandidateHandler = null } LANClientSupported() { return "undefined" !== typeof window.RTCPeerConnection } initializeClient() {
            try {
                null != this.dataChannel && (this.dataChannel.close(), this.dataChannel = null), null != this.peerConnection && this.peerConnection.close(), this.peerConnection =
                    new RTCPeerConnection({ iceServers: this.ICEServers, optional: [{ DtlsSrtpKeyAgreement: !0 }] }), this.readyState = 1
            } catch (d) { this.readyState = -2 }
        } setICEServers(d) { for (var a = this.ICEServers.length = 0; a < d.length; ++a) { var b = d[a].split(";"); 1 == b.length ? this.ICEServers.push({ urls: b[0] }) : 3 == b.length && this.ICEServers.push({ urls: b[0], username: b[1], credential: b[2] }) } } setICECandidateHandler(d) { this.iceCandidateHandler = d } setDescriptionHandler(d) { this.descriptionHandler = d } setRemoteDataChannelHandler(d) {
            this.remoteDataChannelHandler =
            d
        } setRemoteDisconnectHandler(d) { this.remoteDisconnectHandler = d } setRemotePacketHandler(d) { this.remotePacketHandler = d } getReadyState() { return this.readyState } sendPacketToServer(d) { null != this.dataChannel && "open" == this.dataChannel.readyState ? this.dataChannel.send(d) : this.signalRemoteDisconnect(!1) } signalRemoteConnect() {
            const d = this, a = []; this.peerConnection.addEventListener("icecandidate", b => {
                b.candidate && (0 == a.length && setTimeout(() => {
                    null != d.peerConnection && "disconnected" != d.peerConnection.connectionState &&
                    (d.iceCandidateHandler(JSON.stringify(a)), a.length = 0)
                }, 3E3), a.push({ sdpMLineIndex: b.candidate.sdpMLineIndex, candidate: b.candidate.candidate }))
            }); this.dataChannel = this.peerConnection.createDataChannel("lan"); this.dataChannel.binaryType = "arraybuffer"; this.dataChannel.addEventListener("open", async b => { for (; 0 < a.length;)await new Promise(c => setTimeout(c, 0)); d.remoteDataChannelHandler(d.dataChannel) }); this.dataChannel.addEventListener("message", b => { d.remotePacketHandler(b.data) }, !1); this.peerConnection.createOffer(b => { d.peerConnection.setLocalDescription(b, () => { d.descriptionHandler(JSON.stringify(b)) }, c => { console.error("Failed to set local description! " + c); d.readyState = -1; d.signalRemoteDisconnect(!1) }) }, b => { console.error("Failed to set create offer! " + b); d.readyState = -1; d.signalRemoteDisconnect(!1) }); this.peerConnection.addEventListener("connectionstatechange", b => {
                "disconnected" === d.peerConnection.connectionState ? d.signalRemoteDisconnect(!1) : "connected" === d.peerConnection.connectionState ? d.readyState = 2 : "failed" ===
                    d.peerConnection.connectionState && (d.readyState = -1, d.signalRemoteDisconnect(!1))
            })
        } signalRemoteDescription(d) { try { this.peerConnection.setRemoteDescription(JSON.parse(d)) } catch (a) { console.error(a), this.readyState = -1, this.signalRemoteDisconnect(!1) } } signalRemoteICECandidate(d) { try { const a = JSON.parse(d); for (let b of a) this.peerConnection.addIceCandidate(b) } catch (a) { console.error(a), this.readyState = -1, this.signalRemoteDisconnect(!1) } } signalRemoteDisconnect(d) {
            null != this.dataChannel && (this.dataChannel.close(),
                this.dataChannel = null); null != this.peerConnection && this.peerConnection.close(); d || this.remoteDisconnectHandler(); this.readyState = 0
        }
    } window.constructLANClient = () => new k
}; window.startLANClient = () => { "function" !== typeof window.constructLANClient && window.initializeLANClient(); return window.constructLANClient() };
window.initializeLANServer = () => {
    class k {
        constructor(a, b, c) {
            this.client = a; this.peerId = b; this.peerConnection = c; this.dataChannel = null; const f = this, e = []; this.peerConnection.addEventListener("icecandidate", g => { g.candidate && (0 == e.length && setTimeout(() => { null != f.peerConnection && "disconnected" != f.peerConnection.connectionState && (f.client.iceCandidateHandler(f.peerId, JSON.stringify(e)), e.length = 0) }, 3E3), e.push({ sdpMLineIndex: g.candidate.sdpMLineIndex, candidate: g.candidate.candidate })) }); this.peerConnection.addEventListener("datachannel",
                async g => { for (; 0 < e.length;)await new Promise(h => setTimeout(h, 0)); f.dataChannel = g.channel; f.client.remoteClientDataChannelHandler(f.peerId, f.dataChannel); f.dataChannel.addEventListener("message", h => { f.client.remoteClientPacketHandler(f.peerId, h.data) }, !1) }, !1); this.peerConnection.addEventListener("connectionstatechange", g => {
                    "disconnected" === f.peerConnection.connectionState ? f.client.signalRemoteDisconnect(f.peerId) : "connected" === f.peerConnection.connectionState ? 1 != f.client.peerState && (f.client.peerState =
                        1) : "failed" === f.peerConnection.connectionState && (2 == f.client.peerState && (f.client.peerState = 0), f.client.signalRemoteDisconnect(f.peerId))
                })
        } disconnect() { null != this.dataChannel && (this.dataChannel.close(), this.dataChannel = null); this.peerConnection.close() } setRemoteDescription(a) {
            const b = this; try {
                const c = JSON.parse(a); this.peerConnection.setRemoteDescription(c, () => {
                    "offer" == c.type && b.peerConnection.createAnswer(f => {
                        b.peerConnection.setLocalDescription(f, () => {
                            b.client.descriptionHandler(b.peerId, JSON.stringify(f));
                            1 != b.client.peerStateDesc && (b.client.peerStateDesc = 1)
                        }, e => { console.error('Failed to set local description for "' + b.peerId + '"! ' + e); 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0); b.client.signalRemoteDisconnect(b.peerId) })
                    }, f => { console.error('Failed to create answer for "' + b.peerId + '"! ' + f); 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0); b.client.signalRemoteDisconnect(b.peerId) })
                }, f => {
                    console.error('Failed to set remote description for "' + b.peerId + '"! ' + f); 2 == b.client.peerStateDesc &&
                        (b.client.peerStateDesc = 0); b.client.signalRemoteDisconnect(b.peerId)
                })
            } catch (c) { console.error('Failed to parse remote description for "' + b.peerId + '"! ' + c), 2 == b.client.peerStateDesc && (b.client.peerStateDesc = 0), b.client.signalRemoteDisconnect(b.peerId) }
        } addICECandidate(a) {
            try { const b = JSON.parse(a); for (let c of b) this.peerConnection.addIceCandidate(new RTCIceCandidate(c)); 1 != this.client.peerStateIce && (this.client.peerStateIce = 1) } catch (b) {
                console.error('Failed to parse ice candidate for "' + this.peerId +
                    '"! ' + b), 2 == this.client.peerStateIce && (this.client.peerStateIce = 0), this.client.signalRemoteDisconnect(this.peerId)
            }
        }
    } class d {
        constructor() { this.ICEServers = []; this.hasInit = !1; this.peerList = new Map; this.peerStateIce = this.peerStateDesc = this.peerStateInitial = this.peerStateConnect = this.peerState = 2; this.remoteClientPacketHandler = this.remoteClientDisconnectHandler = this.remoteClientDataChannelHandler = this.descriptionHandler = this.iceCandidateHandler = null } LANServerSupported() { return "undefined" !== typeof window.RTCPeerConnection } initializeServer() { } setICEServers(a) {
            for (var b =
                this.ICEServers.length = 0; b < a.length; ++b) { var c = a[b].split(";"); 1 == c.length ? this.ICEServers.push({ urls: c[0] }) : 3 == c.length && this.ICEServers.push({ urls: c[0], username: c[1], credential: c[2] }) }
        } setICECandidateHandler(a) { this.iceCandidateHandler = a } setDescriptionHandler(a) { this.descriptionHandler = a } setRemoteClientDataChannelHandler(a) { this.remoteClientDataChannelHandler = a } setRemoteClientDisconnectHandler(a) { this.remoteClientDisconnectHandler = a } setRemoteClientPacketHandler(a) {
            this.remoteClientPacketHandler =
            a
        } sendPacketToRemoteClient(a, b) { var c = this.peerList.get(a); "undefined" !== typeof c && null !== c && (null != c.dataChannel && "open" == c.dataChannel.readyState ? c.dataChannel.send(b) : this.signalRemoteDisconnect(a)) } resetPeerStates() { this.peerState = this.peerStateConnect = this.peerStateInitial = this.peerStateDesc = this.peerStateIce = 2 } getPeerState() { return this.peerState } getPeerStateConnect() { return this.peerStateConnect } getPeerStateInitial() { return this.peerStateInitial } getPeerStateDesc() { return this.peerStateDesc } getPeerStateIce() { return this.peerStateIce } signalRemoteConnect(a) {
            try {
                const b =
                    new RTCPeerConnection({ iceServers: this.ICEServers, optional: [{ DtlsSrtpKeyAgreement: !0 }] }), c = new k(this, a, b); this.peerList.set(a, c); 1 != this.peerStateConnect && (this.peerStateConnect = 1)
            } catch (b) { 2 == this.peerStateConnect && (this.peerStateConnect = 0) }
        } signalRemoteDescription(a, b) { a = this.peerList.get(a); "undefined" !== typeof a && null !== a && a.setRemoteDescription(b) } signalRemoteICECandidate(a, b) { a = this.peerList.get(a); "undefined" !== typeof a && null !== a && a.addICECandidate(b) } signalRemoteDisconnect(a) {
            if (0 == a.length) {
                for (var b of this.peerList.values()) if ("undefined" !==
                    typeof b && null !== b) { this.peerList.delete(a); try { b.disconnect() } catch (c) { } this.remoteClientDisconnectHandler(a) } this.peerList.clear()
            } else if (b = this.peerList.get(a), "undefined" !== typeof b && null !== b) { this.peerList.delete(a); try { b.disconnect() } catch (c) { } this.remoteClientDisconnectHandler(a) }
        } countPeers() { return this.peerList.size }
    } window.constructLANServer = () => new d
}; window.startLANServer = () => { "function" !== typeof window.constructLANServer && window.initializeLANServer(); return window.constructLANServer() };
