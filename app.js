class VoiceNoteApp {
    constructor() {
        this.isRecording = false;
        this.isPaused = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.init();
    }

    init() {
        // Initialize app
        console.log('VoiceNote App Initialized');
    }

    // Switch between states
    setState(state) {
        document.querySelectorAll('.state').forEach(el => el.classList.remove('active'));
        document.querySelector(`.state-${state}`).classList.add('active');
    }

    // Start Recording
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                // Here you would send to server for transcription
                console.log('Recording stopped, blob size:', audioBlob.size);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.startTimer();
            this.setState('recording');
        } catch (error) {
            alert('无法访问麦克风，请检查权限设置');
            console.error('Error accessing microphone:', error);
        }
    }

    // Toggle Pause/Resume
    togglePause() {
        if (this.isPaused) {
            this.resumeRecording();
        } else {
            this.pauseRecording();
        }
    }

    // Pause Recording
    pauseRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.isPaused = true;
            clearInterval(this.timerInterval);
            
            // Change icon to play
            document.getElementById('recordIcon').innerHTML = `
                <polygon points="8 5 19 12 8 19 8 5" fill="white"/>
            `;
        }
    }

    // Resume Recording
    resumeRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime;
            this.startTimer();
            
            // Change icon back to pause
            document.getElementById('recordIcon').innerHTML = `
                <rect x="7" y="6" width="3" height="12" rx="1"/>
                <rect x="14" y="6" width="3" height="12" rx="1"/>
            `;
        }
    }

    // Stop Recording
    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            clearInterval(this.timerInterval);
            
            // Update final timer display
            document.getElementById('finalTimer').textContent = this.formatTime(this.elapsedTime);
            
            // Switch to complete state
            this.setState('complete');
            
            // Simulate transcription (in real app, call API)
            this.simulateTranscription();
        }
    }

    // Timer Functions
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            document.getElementById('timer').textContent = this.formatTime(this.elapsedTime);
        }, 100);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Save Recording
    saveRecording() {
        alert('录音已保存到本地！');
        // In real app, save to server/localStorage
        this.reset();
    }

    // Generate AI Summary
    async generateSummary() {
        const btn = document.getElementById('summaryBtn');
        const card = document.getElementById('aiSummaryCard');
        
        btn.classList.add('loading');
        btn.textContent = '生成中...';
        
        // Simulate AI processing (in real app, call OpenAI/Claude API)
        setTimeout(() => {
            this.displaySummary();
            card.style.display = 'block';
            btn.classList.remove('loading');
            btn.textContent = '✓ 已生成';
            btn.disabled = true;
        }, 2000);
    }

    displaySummary() {
        const summaryHtml = `
            <h3>📋 会议核心要点</h3>
            <ul>
                <li>项目进展：当前处于第一阶段开发，需在下周完成关键功能</li>
                <li>团队协作：各部门针对设计方案和技术实现达成共识</li>
                <li>用户体验：产品经理强调以用户为中心的设计理念</li>
                <li>下一步计划：本周完成技术评审，月底完成产品演示</li>
            </ul>
            <h3>💡 关键决策</h3>
            <p>团队一致同意优先完成核心功能开发，确保产品质量和用户体验。</p>
        `;
        document.getElementById('summaryContent').innerHTML = summaryHtml;
    }

    // Simulate Transcription
    simulateTranscription() {
        // In real app, send audio to Whisper API or similar
        const mockText = '今天的会议主要讨论了项目的进展情况。我们需要在下周完成第一阶段的开发工作。团队成员对新功能的设计方案提出了一些建议。';
        document.getElementById('originalText').textContent = mockText;
    }

    // Copy Functions
    copySummary() {
        const content = document.getElementById('summaryContent').innerText;
        this.copyToClipboard(content, 'AI总结已复制');
    }

    copyOriginal() {
        const content = document.getElementById('originalText').innerText;
        this.copyToClipboard(content, '原始文本已复制');
    }

    copyToClipboard(text, message) {
        navigator.clipboard.writeText(text).then(() => {
            alert(message);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    // Show History (placeholder)
    showHistory() {
        alert('历史记录功能开发中...');
    }

    // Reset to initial state
    reset() {
        this.elapsedTime = 0;
        this.startTime = null;
        this.isPaused = false;
        document.getElementById('aiSummaryCard').style.display = 'none';
        document.getElementById('summaryBtn').disabled = false;
        document.getElementById('summaryBtn').textContent = 'AI 总结';
        this.setState('ready');
    }
}

// Initialize app
const app = new VoiceNoteApp();
