// 全局变量
let currentGame = 'menu';
let lotteryItems = [];
let wheelOptions = [];
let wheelAngle = 0;
let isSpinning = false;

// 游戏数据
const drawWords = {
    animals: ['猫', '狗', '大象', '长颈鹿', '企鹅', '熊猫', '老虎', '兔子', '猴子', '狮子'],
    food: ['汉堡', '披萨', '寿司', '火锅', '煎饼', '冰淇淋', '蛋糕', '炸鸡', '面条', '饺子'],
    objects: ['手机', '电脑', '雨伞', '眼镜', '书', '钥匙', '杯子', '椅子', '灯', '钟表'],
    actions: ['跑步', '游泳', '唱歌', '跳舞', '睡觉', '吃饭', '微笑', '哭泣', '飞翔', '爬山']
};

const truthQuestions = [
    '你暗恋过谁？',
    '你做过最尴尬的事是什么？',
    '你最害怕什么？',
    '你撒过最大的谎是什么？',
    '你最后悔的一件事是什么？',
    '你最想去哪里旅行？',
    '你的初恋是谁？',
    '你最讨厌什么类型的人？',
    '你最喜欢在座的谁？',
    '你做过最疯狂的事是什么？'
];

const dareActions = [
    '学猫叫三声',
    '做10个俯卧撑',
    '唱一首歌',
    '模仿一个动物',
    '跳一段舞',
    '说一个冷笑话',
    '倒着说一句话',
    '做一个鬼脸保持10秒',
    '给任意一人一个拥抱',
    '用屁股写自己的名字'
];

const undercoverWords = [
    { civilian: '苹果', spy: '梨' },
    { civilian: '汽车', spy: '自行车' },
    { civilian: '手机', spy: '电脑' },
    { civilian: '猫', spy: '狗' },
    { civilian: '可乐', spy: '雪碧' },
    { civilian: '牛奶', spy: '豆浆' },
    { civilian: '西瓜', spy: '哈密瓜' },
    { civilian: '饺子', spy: '包子' },
    { civilian: '医生', spy: '护士' },
    { civilian: '眉毛', spy: '睫毛' }
];

// 切换游戏界面
function showGame(gameId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(gameId).classList.add('active');
    currentGame = gameId;
    
    // 初始化特定游戏
    if (gameId === 'wheel') {
        initWheel();
    } else if (gameId === 'dice') {
        updateDiceCount();
    }
}

// 你画我猜
function getDrawWord() {
    const category = document.getElementById('draw-category').value;
    let words = [];
    
    if (category === 'all') {
        words = Object.values(drawWords).flat();
    } else {
        words = drawWords[category];
    }
    
    const word = words[Math.floor(Math.random() * words.length)];
    document.getElementById('word-display').textContent = word;
}

// 真心话大冒险
function getTruth() {
    const question = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
    document.getElementById('td-result').textContent = question;
}

function getDare() {
    const action = dareActions[Math.floor(Math.random() * dareActions.length)];
    document.getElementById('td-result').textContent = action;
}

// 谁是卧底
function startUndercover() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    const spyCount = parseInt(document.getElementById('spy-count').value);
    
    if (spyCount >= playerCount) {
        alert('卧底人数必须少于玩家总数！');
        return;
    }
    
    const wordPair = undercoverWords[Math.floor(Math.random() * undercoverWords.length)];
    const players = [];
    
    // 生成玩家角色
    for (let i = 0; i < playerCount; i++) {
        players.push(i < spyCount ? 'spy' : 'civilian');
    }
    
    // 洗牌
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }
    
    // 显示卡片
    const display = document.getElementById('uc-display');
    display.innerHTML = '';
    
    players.forEach((role, index) => {
        const card = document.createElement('div');
        card.className = 'uc-card';
        card.innerHTML = `
            <h3>玩家 ${index + 1}</h3>
            <div class="uc-word" data-word="${role === 'spy' ? wordPair.spy : wordPair.civilian}">
                点击查看词语
            </div>
        `;
        
        card.onclick = function() {
            const wordEl = this.querySelector('.uc-word');
            if (!wordEl.classList.contains('revealed')) {
                wordEl.textContent = wordEl.dataset.word;
                wordEl.classList.add('revealed');
                setTimeout(() => {
                    wordEl.textContent = '点击查看词语';
                    wordEl.classList.remove('revealed');
                }, 3000);
            }
        };
        
        display.appendChild(card);
    });
}

// 幸运转盘
function initWheel() {
    wheelOptions = ['选项1', '选项2', '选项3', '选项4', '选项5', '选项6'];
    drawWheel();
}

function updateWheel() {
    const input = document.getElementById('wheel-options').value.trim();
    if (input) {
        wheelOptions = input.split('\n').filter(opt => opt.trim());
        if (wheelOptions.length < 2) {
            alert('至少需要2个选项！');
            return;
        }
        drawWheel();
    }
}

function drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const anglePerOption = (2 * Math.PI) / wheelOptions.length;
    
    wheelOptions.forEach((option, index) => {
        const startAngle = wheelAngle + index * anglePerOption;
        const endAngle = startAngle + anglePerOption;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerOption / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(option, radius * 0.65, 5);
        ctx.restore();
    });
    
    // 绘制指针
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX - 15, 50);
    ctx.lineTo(centerX + 15, 50);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;
    
    const spins = 5 + Math.random() * 5;
    const totalRotation = spins * 2 * Math.PI;
    const duration = 3000;
    const startTime = Date.now();
    
    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3);
        wheelAngle = totalRotation * easeOut;
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 计算结果
            const normalizedAngle = (wheelAngle % (2 * Math.PI));
            const index = Math.floor(((2 * Math.PI - normalizedAngle) / (2 * Math.PI)) * wheelOptions.length) % wheelOptions.length;
            
            setTimeout(() => {
                alert(`结果是：${wheelOptions[index]}`);
                isSpinning = false;
                document.getElementById('spin-btn').disabled = false;
            }, 100);
        }
    }
    
    animate();
}

// 抽签
function resetLottery() {
    const input = document.getElementById('lottery-items').value.trim();
    if (input) {
        lotteryItems = input.split('\n').filter(item => item.trim());
        document.getElementById('remaining').textContent = `剩余：${lotteryItems.length}`;
        document.getElementById('lottery-result').textContent = '准备抽签';
    }
}

function drawLottery() {
    if (lotteryItems.length === 0) {
        const input = document.getElementById('lottery-items').value.trim();
        if (!input) {
            alert('请先设置签筒内容！');
            return;
        }
        resetLottery();
    }
    
    if (lotteryItems.length > 0) {
        const index = Math.floor(Math.random() * lotteryItems.length);
        const result = lotteryItems.splice(index, 1)[0];
        document.getElementById('lottery-result').textContent = result;
        document.getElementById('remaining').textContent = `剩余：${lotteryItems.length}`;
    } else {
        alert('签已抽完！');
    }
}

// 骰子
function updateDiceCount() {
    const count = parseInt(document.getElementById('dice-count').value);
    const container = document.getElementById('dice-container');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.textContent = '?';
        container.appendChild(dice);
    }
    
    document.getElementById('dice-total').textContent = '';
}

function rollDice() {
    const diceElements = document.querySelectorAll('.dice');
    let total = 0;
    
    diceElements.forEach((dice, index) => {
        // 添加动画
        dice.style.animation = 'none';
        setTimeout(() => {
            dice.style.animation = 'roll 0.5s';
        }, index * 100);
        
        setTimeout(() => {
            const value = Math.floor(Math.random() * 6) + 1;
            dice.textContent = value;
            total += value;
            
            if (index === diceElements.length - 1) {
                setTimeout(() => {
                    document.getElementById('dice-total').textContent = `总点数：${total}`;
                }, 100);
            }
        }, 500 + index * 100);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置初始值
    document.getElementById('wheel-options').value = '小明\n小红\n小刚\n小美\n小李\n小张';
    document.getElementById('lottery-items').value = '一等奖\n二等奖\n三等奖\n谢谢参与\n谢谢参与\n谢谢参与';
    document.getElementById('remaining').textContent = '剩余：0';
});
