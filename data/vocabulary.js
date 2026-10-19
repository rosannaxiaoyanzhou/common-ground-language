// The meaning of each symbol in every language the site speaks.
// One line per glyph:  glyph name | 中文 | español | français | 日本語
// Several ways to say the same thing are separated by "/"; the first one is
// shown in the dictionary, and all of them turn into the symbol on the keyboard.
// English comes from the font itself (the words you type to get each symbol).
// To add a language: add a column here, then its name to LANGS in i18n.js.
window.VOCAB_COLUMNS = ["zh", "es", "fr", "ja"];
window.VOCAB = `
w.happy | 开心/快乐/高兴 | feliz/contento | heureux/content | 嬉しい/楽しい
w.sad | 难过/伤心 | triste | triste | 悲しい
w.like | 喜欢 | gustar | aimer bien | 好き
w.love | 爱 | amar/amor | aimer/amour | 愛/愛する
w.hate | 讨厌/恨 | odiar | détester | 嫌い/憎む
w.fear | 害怕/怕 | miedo/temer | peur/craindre | 怖い/恐れる
w.need | 需要 | necesitar | avoir besoin | 必要
w.remember | 记得/记住 | recordar | se souvenir | 覚える/思い出す
w.forget | 忘记/忘 | olvidar | oublier | 忘れる
w.understand | 明白/理解/懂 | entender/comprender | comprendre | 分かる/理解する
w.agree | 同意 | estar de acuerdo | être d'accord | 賛成
w.choose | 选择/选 | elegir | choisir | 選ぶ
w.try | 尝试/试 | intentar/probar | essayer | 試す
w.learn | 学/学习 | aprender | apprendre | 学ぶ/習う
w.teach | 教 | enseñar | enseigner | 教える
w.eat | 吃 | comer | manger | 食べる
w.drink | 喝 | beber | boire | 飲む
w.sleep | 睡觉/睡 | dormir | dormir | 寝る
w.walk | 走路/走 | caminar | marcher | 歩く
w.run | 跑 | correr | courir | 走る
w.sit | 坐 | sentarse | s'asseoir | 座る
w.stand | 站 | estar de pie | être debout | 立つ
w.wear | 穿/戴 | llevar puesto/vestir | porter | 着る
w.wash | 洗 | lavar | laver | 洗う
w.cook | 做饭/煮 | cocinar | cuisiner | 料理する
w.play | 玩 | jugar | jouer | 遊ぶ
w.sing | 唱歌/唱 | cantar | chanter | 歌う
w.go | 去 | ir | aller | 行く
w.come | 来 | venir | venir | 来る
w.give | 给 | dar | donner | あげる/与える
w.take | 拿/取 | tomar/coger | prendre | 取る
w.send | 寄/发送 | enviar | envoyer | 送る
w.meet | 见面/遇见 | encontrarse/conocer | rencontrer | 会う
w.find | 找到/发现 | encontrar | trouver | 見つける
w.lose | 丢/失去 | perder | perdre | なくす/失う
w.pay | 付钱/付 | pagar | payer | 払う
w.buy | 买 | comprar | acheter | 買う
w.help | 帮助/帮 | ayudar/ayuda | aider/aide | 助ける/手伝う
w.make | 做/制作 | hacer/fabricar | faire/fabriquer | 作る
w.work | 工作 | trabajar/trabajo | travailler/travail | 働く/仕事
w.live | 生活/住 | vivir | vivre/habiter | 住む/生きる
w.speak | 说话/讲 | hablar | parler | 話す
w.read | 读/看书 | leer | lire | 読む
w.write | 写 | escribir | écrire | 書く
w.question | 问/问题 | preguntar/pregunta | demander/question | 聞く/質問
w.call | 打电话/叫 | llamar | appeler | 電話する/呼ぶ
w.start | 开始 | empezar/comenzar | commencer | 始める
w.finish | 完成/结束 | terminar/acabar | finir/terminer | 終わる
w.stop | 停/停止 | parar/detener | arrêter | 止まる/止める
w.wait | 等/等待 | esperar | attendre | 待つ
w.open | 开/打开 | abrir | ouvrir | 開ける
w.close | 关/关上 | cerrar | fermer | 閉める
w.win | 赢 | ganar | gagner | 勝つ
w.lose_game | 输 | perder el juego | perdre la partie | 負ける
w.future | 将来/未来 | futuro | avenir/futur | 未来/将来
w.yesterday | 昨天 | ayer | hier | 昨日
w.today | 今天 | hoy | aujourd'hui | 今日
w.tomorrow | 明天 | mañana | demain | 明日
w.hot | 热 | caliente/calor | chaud | 暑い/熱い
w.cold | 冷 | frío | froid | 寒い/冷たい
w.new | 新 | nuevo | nouveau | 新しい
w.old | 旧/老 | viejo | vieux/ancien | 古い
w.fast | 快 | rápido | rapide | 速い
w.slow | 慢 | lento | lent | 遅い
w.easy | 容易/简单 | fácil | facile | 簡単
w.hard | 难/困难 | difícil | difficile | 難しい
w.clean | 干净 | limpio | propre | きれい/清潔
w.dirty | 脏 | sucio | sale | 汚い
w.full | 满/饱 | lleno | plein | いっぱい/満腹
w.empty | 空 | vacío | vide | 空っぽ
w.safe | 安全 | seguro | sûr/en sécurité | 安全
w.dangerous | 危险 | peligroso | dangereux | 危ない/危険
w.beautiful | 美/漂亮 | bonito/hermoso | beau/belle | 美しい/きれいな
w.rich | 有钱/富 | rico | riche | 金持ち
w.poor | 穷 | pobre | pauvre | 貧しい
w.sick | 生病/病 | enfermo | malade | 病気
w.teacher | 老师 | profesor/maestro | professeur | 先生
w.doctor | 医生 | médico/doctor | médecin | 医者
w.friend | 朋友 | amigo | ami | 友達
w.enemy | 敌人 | enemigo | ennemi | 敵
w.school | 学校 | escuela | école | 学校
w.hospital | 医院 | hospital | hôpital | 病院
w.city | 城市 | ciudad | ville | 町/都市
w.world | 世界 | mundo | monde | 世界
s.feel | 感觉 | sentir | sentir/ressentir | 感じる
s.heart | 心 | corazón | cœur | 心/ハート
s.good | 好 | bueno/bien | bon/bien | 良い/いい
s.bad | 坏/不好 | malo/mal | mauvais/mal | 悪い
s.up | 上 | arriba | haut/en haut | 上
s.down | 下 | abajo | bas/en bas | 下
s.toward | 向/朝 | hacia | vers | 向かって/へ
s.toself | 向自己 | hacia mí | vers soi | 自分へ
s.want | 想要/要 | querer | vouloir | 欲しい/したい
s.have | 有 | tener | avoir | 持つ/ある
s.hand | 手 | mano | main | 手
s.mind | 头脑/心思 | mente | esprit | 頭/心
s.know | 知道 | saber | savoir | 知る
s.think | 想/思考 | pensar | penser | 考える/思う
s.inside | 里面/内 | dentro | dedans | 中/内側
s.enclosure | 围/范围 | recinto | enclos | 囲い
s.container | 容器 | recipiente | récipient | 入れ物
s.same | 一样/相同 | igual/mismo | pareil/même | 同じ
s.one | 一/一个 | uno | un | 一つ
s.few | 几个/少 | pocos | peu | 少し
s.do | 做/干 | hacer | faire | する
s.maybe | 也许/可能 | quizás/tal vez | peut-être | 多分/かもしれない
s.can | 能/可以 | poder | pouvoir | できる
s.very | 很/非常 | muy | très | とても
s.mouth | 嘴 | boca | bouche | 口
s.eye | 眼睛/眼 | ojo | œil | 目
s.see | 看/看见 | ver | voir | 見る
s.hear | 听/听见 | oír/escuchar | entendre/écouter | 聞こえる/聴く
s.say | 说 | decir | dire | 言う
s.body | 身体 | cuerpo | corps | 体
s.person | 人/某人 | persona/alguien | personne/quelqu'un | 人/誰か
s.foot | 脚 | pie | pied | 足
s.clothing | 衣服 | ropa | vêtement | 服
s.touch | 摸/接触 | tocar | toucher | 触る
s.food | 食物/吃的 | comida | nourriture | 食べ物
s.water | 水 | agua | eau | 水
s.fire | 火 | fuego | feu | 火
s.night | 晚上/夜 | noche | nuit | 夜
s.day | 白天/天 | día | jour | 昼/日
s.earth | 土地/地球 | tierra | terre | 地面/大地
s.house | 房子/家 | casa | maison | 家
s.money | 钱 | dinero | argent | お金
s.value | 价值 | valor | valeur | 価値
s.something | 东西/某物 | algo/cosa | quelque chose/chose | 物/何か
s.book | 书 | libro | livre | 本
s.word | 词/字 | palabra | mot | 言葉
s.protection | 保护 | protección/proteger | protection/protéger | 守る/保護
s.move | 动/移动 | mover/moverse | bouger | 動く
s.far | 远 | lejos | loin | 遠い
s.near | 近 | cerca | près | 近い
s.here | 这里 | aquí | ici | ここ
s.be | 是/存在 | ser/estar | être | ある/いる
s.all | 全部/所有 | todo/todos | tout/tous | 全部/みんな
s.more | 更多/多 | más | plus | もっと
s.happen | 发生 | pasar/suceder | arriver/se passer | 起きる
s.time | 时间 | tiempo/hora | temps | 時間
s.before | 以前/之前 | antes | avant | 前に
s.now | 现在 | ahora | maintenant | 今
s.after | 以后/之后 | después | après | 後で
s.short | 短 | corto | court | 短い
s.long | 长 | largo | long | 長い
s.not | 不/没 | no | ne pas/non | ない
s.me | 我/我的 | yo/mí/me/mi/mis/mío/mía | je/moi/me/mon/ma/mes | 私/わたし/僕/私の
s.you | 你/您/你的/您的 | tú/usted/ti/te/tu/tus/tuyo/tuya | tu/toi/vous/te/ton/ta/tes/votre/vos | あなた/君/あなたの
s.she | 她/她的 | ella | elle | 彼女/彼女の
s.he | 他/他的 | él | il/lui | 彼/彼の
s.us | 我们/他们/她们/大家/我们的/他们的/她们的/大家的 | nosotros/nosotras/ellos/ellas/nuestro/nuestra/nuestros/nuestras | nous/ils/elles/notre/nos/leur/leurs | 私たち/彼ら/皆さん/私たちの/彼らの
m.past | 过去 | pasado | passé | 過去
m.future | 将来 | futuro | futur | 未来
m.intensity | 强烈 | intensidad | intensité | 強さ
m.quality | 性质 | cualidad | qualité | 性質
m.question | 疑问 | pregunta | question | 疑問
m.opposite_of | 相反 | lo contrario | contraire | 反対
m.action | 动作 | acción | action | 動作
m.many | 很多 | muchos | beaucoup | 多い
m.person_who | 做…的人 | persona que | celui qui | …する人
m.place_for | 地方 | lugar para | lieu pour | …する場所
`;
