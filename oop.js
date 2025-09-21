// 发音功能核心模块
const PhonicsReader = {
    // 初始化发音功能
    init() {
        this.attachEventListeners();
        this.initProgressTracking();
        this.initCategoryFilters();
        this.initMobileMenu();
    },
    
    // 语音合成配置
    speechConfig: {
        lang: 'en-US',
        rate: 0.9,
        pitch: 1.1,
        volume: 1
    },
    
    // 绑定所有发音元素的点击事件
    attachEventListeners() {
        const phoneticItems = document.querySelectorAll('.phonetic-item');
        
        phoneticItems.forEach(item => {
            item.addEventListener('click', () => {
                this.playPronunciation(item);
            });
            
            // 添加触摸反馈样式
            item.classList.add('cursor-pointer', 'hover:bg-primary/5', 'px-1', 'rounded');
        });
    },
    
    // 播放发音
    playPronunciation(element) {
        // 停止任何正在播放的语音
        window.speechSynthesis.cancel();
        
        // 获取要发音的文本
        const text = element.getAttribute('data-text');
        if (!text) return;
        
        // 显示播放状态
        element.classList.add('audio-playing');
        
        // 创建语音实例
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 应用配置
        Object.assign(utterance, this.speechConfig);
        
        // 发音结束时移除播放状态
        utterance.onend = () => {
            element.classList.remove('audio-playing');
        };
        
        // 播放语音
        window.speechSynthesis.speak(utterance);
        
        // 记录学习进度
        this.updateProgress(element);
    },
    
    // 初始化进度跟踪
    initProgressTracking() {
        // 从本地存储加载进度
        const progress = JSON.parse(localStorage.getItem('phonicsProgress')) || {
            letters: { total: 26, completed: 0 },
            vowels: { total: 140, completed: 0 },
            consonants: { total: 60, completed: 0 },
            words: { total: 50, completed: 0 }
        };
        
        // 存储到实例
        this.progress = progress;
        
        // 更新UI显示
        this.updateProgressUI();
    },
    
    // 更新学习进度
    updateProgress(element) {
        // 确定项目类型
        let type = '';
        
        if (element.hasAttribute('data-letter')) {
            type = 'letters';
        } else if (element.closest('.vowel-item')) {
            type = 'vowels';
        } else if (element.closest('.consonant-item')) {
            type = 'consonants';
        } else if (element.closest('#words')) {
            type = 'words';
        }
        
        // 如果已记录过则不再重复计数
        const id = element.getAttribute('data-text') || element.textContent;
        const storedItems = JSON.parse(localStorage.getItem(`phonics_${type}_completed`)) || [];
        
        if (type && !storedItems.includes(id)) {
            // 添加到已完成列表
            storedItems.push(id);
            localStorage.setItem(`phonics_${type}_completed`, JSON.stringify(storedItems));
            
            // 更新进度计数
            this.progress[type].completed = storedItems.length;
            
            // 确保不超过总数
            if (this.progress[type].completed > this.progress[type].total) {
                this.progress[type].completed = this.progress[type].total;
            }
            
            // 保存进度
            localStorage.setItem('phonicsProgress', JSON.stringify(this.progress));
            
            // 更新UI
            this.updateProgressUI();
        }
    },
    
    // 更新进度UI显示
    updateProgressUI() {
        // 计算总体进度
        const total = 
            this.progress.letters.total + 
            this.progress.vowels.total + 
            this.progress.consonants.total + 
            this.progress.words.total;
            
        const completed = 
            this.progress.letters.completed + 
            this.progress.vowels.completed + 
            this.progress.consonants.completed + 
            this.progress.words.completed;
            
        const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // 更新总体进度条
        document.getElementById('overall-progress-bar').style.width = `${overallPercent}%`;
        document.getElementById('overall-progress-text').textContent = `${overallPercent}%`;
        
        // 更新各部分进度
        document.getElementById('letters-progress-text').textContent = 
            `${this.progress.letters.completed}/${this.progress.letters.total}`;
        document.getElementById('letters-progress-bar').style.width = 
            `${(this.progress.letters.completed / this.progress.letters.total) * 100}%`;
            
        document.getElementById('vowels-progress-text').textContent = 
            `${this.progress.vowels.completed}/${this.progress.vowels.total}`;
        document.getElementById('vowels-progress-bar').style.width = 
            `${(this.progress.vowels.completed / this.progress.vowels.total) * 100}%`;
            
        document.getElementById('consonants-progress-text').textContent = 
            `${this.progress.consonants.completed}/${this.progress.consonants.total}`;
        document.getElementById('consonants-progress-bar').style.width = 
            `${(this.progress.consonants.completed / this.progress.consonants.total) * 100}%`;
            
        document.getElementById('words-sentences-progress-text').textContent = 
            `${this.progress.words.completed}/${this.progress.words.total}`;
        document.getElementById('words-sentences-progress-bar').style.width = 
            `${(this.progress.words.completed / this.progress.words.total) * 100}%`;
    },
    
    // 初始化分类筛选功能
    initCategoryFilters() {
        const tabs = document.querySelectorAll('.vowel-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签的活跃状态
                tabs.forEach(t => {
                    t.classList.remove('active', 'bg-primary', 'text-white');
                    t.classList.add('bg-gray-200', 'hover:bg-gray-300');
                });
                
                // 添加当前标签的活跃状态
                tab.classList.add('active', 'bg-primary', 'text-white');
                tab.classList.remove('bg-gray-200', 'hover:bg-gray-300');
                
                // 获取分类
                const category = tab.getAttribute('data-category');
                const items = document.querySelectorAll('.vowel-item');
                
                // 筛选显示项目
                items.forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    },
    
    // 初始化移动端菜单
    initMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // 移动端导航链接点击后关闭菜单
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
        
        // 滚动时改变导航栏样式
        window.addEventListener('scroll', () => {
            const header = document.getElementById('main-header');
            if (window.scrollY > 50) {
                header.classList.add('py-2', 'shadow-lg');
                header.classList.remove('py-3', 'shadow-md');
            } else {
                header.classList.add('py-3', 'shadow-md');
                header.classList.remove('py-2', 'shadow-lg');
            }
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化发音功能
    PhonicsReader.init();
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 更新导航活跃状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active-nav');
                });
                this.classList.add('active-nav');
            }
        });
    });
});