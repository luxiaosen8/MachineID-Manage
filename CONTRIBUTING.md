# 璐＄尞鎸囧崡

鎰熻阿鎮ㄥ MachineID-Manage 椤圭洰鐨勫叴瓒ｏ紒鎴戜滑娆㈣繋鍚勭褰㈠紡鐨勮础鐚紝鍖呮嫭浣嗕笉闄愪簬锛?
- 馃悰 鎶ュ憡 Bug
- 馃挕 鎻愬嚭鏂板姛鑳藉缓璁?- 馃摑 鏀硅繘鏂囨。
- 馃敡 鎻愪氦浠ｇ爜淇
- 鉁?娣诲姞鏂板姛鑳?- 馃帹 鏀硅繘鐢ㄦ埛鐣岄潰
- 馃寪 缈昏瘧鏂囨。

## 鐩綍

1. [琛屼负鍑嗗垯](#琛屼负鍑嗗垯)
2. [濡備綍璐＄尞](#濡備綍璐＄尞)
3. [寮€鍙戠幆澧冭缃甝(#寮€鍙戠幆澧冭缃?
4. [鎻愪氦瑙勮寖](#鎻愪氦瑙勮寖)
5. [浠ｇ爜瀹℃煡娴佺▼](#浠ｇ爜瀹℃煡娴佺▼)
6. [绀惧尯璧勬簮](#绀惧尯璧勬簮)

---

## 琛屼负鍑嗗垯

鎴戜滑鎵胯涓虹ぞ鍖烘彁渚涗竴涓弸濂姐€佸畨鍏ㄣ€佸寘瀹圭殑鐜銆傝閬靛畧浠ヤ笅鍑嗗垯锛?
### 鏈熸湜鐨勮涓?- 浣跨敤娆㈣繋鍜屽寘瀹圭殑璇█
- 灏婇噸涓嶅悓鐨勮鐐瑰拰缁忓巻
- 浼橀泤鍦版帴鍙楀缓璁炬€ф壒璇?- 鍏虫敞瀵圭ぞ鍖烘渶鏈夊埄鐨勪簨鎯?- 瀵瑰叾浠栫ぞ鍖烘垚鍛樿〃鐜板嚭鍚岀悊蹇?
### 涓嶅彲鎺ュ彈鐨勮涓?- 浣跨敤鎬у埆姝ц鐨勮瑷€鎴栧浘鍍?- 璺熻釜鎴栭獨鎵颁换浣曚汉
- 鍙戝竷浠栦汉鐨勭浜轰俊鎭?- 浠讳綍褰㈠紡鐨勬瑙嗐€侀獨鎵版垨璐綆

## 濡備綍璐＄尞

### 鎶ュ憡 Bug

鍦ㄦ姤鍛?Bug 涔嬪墠锛岃锛?1. 鎼滅储鐜版湁 Issues锛岀‘璁ら棶棰樺皻鏈姤鍛?2. 浣跨敤鏈€鏂扮殑绋冲畾鐗堟湰
3. 鍑嗗澶嶇幇 Bug 鐨勮缁嗘楠?
Bug 鎶ュ憡搴斿寘鍚細
- 娓呮櫚鐨勯棶棰樻弿杩?- 澶嶇幇姝ラ锛?銆?銆?...锛?- 棰勬湡琛屼负涓庡疄闄呰涓?- 鎴浘鎴栨棩蹇楋紙濡傞€傜敤锛?- 鐜淇℃伅锛堟搷浣滅郴缁熴€佺増鏈瓑锛?
### 寤鸿鏂板姛鑳?
鎴戜滑娆㈣繋鏂板姛鑳藉缓璁紒璇凤細
1. 鎼滅储鐜版湁 Issues锛岀‘璁ゅ缓璁皻鏈瓨鍦?2. 璇︾粏鎻忚堪鍔熻兘闇€姹?3. 瑙ｉ噴涓轰粈涔堟鍔熻兘瀵归」鐩湁浠峰€?4. 鎻愪緵鍙兘鐨勫疄鐜版柟妗?
### 鎻愪氦浠ｇ爜

1. Fork 鏈粨搴?2. 鍒涘缓鐗规€у垎鏀細`git checkout -b feature/AmazingFeature`
3. 鎻愪氦鏇存敼锛歚git commit -m 'Add some AmazingFeature'`
4. 鎺ㄩ€佸垎鏀細`git push origin feature/AmazingFeature`
5. 鎵撳紑 Pull Request

## 寮€鍙戠幆澧冭缃?
### 鍓嶇疆鏉′欢
- Windows 10/11
- Rust 1.70+
- Node.js 18+
- Git

### 璁剧疆姝ラ

```bash
# 1. 鍏嬮殕浠撳簱
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 2. 瀹夎渚濊禆
npm install

# 3. 瀹夎 Rust 渚濊禆
cargo fetch

# 4. 鍚姩寮€鍙戞湇鍔″櫒
cargo tauri dev
```

### 浠ｇ爜缁撴瀯

```
MachineID-Manage/
鈹溾攢鈹€ src-tauri/           # Tauri 鍚庣 (Rust)
鈹?  鈹溾攢鈹€ src/            # 婧愪唬鐮?鈹?  鈹?  鈹溾攢鈹€ main.rs     # Tauri 鍛戒护鍏ュ彛
鈹?  鈹?  鈹斺攢鈹€ machine_id.rs # 鏈哄櫒鐮佽鍐欓€昏緫
鈹?  鈹溾攢鈹€ Cargo.toml      # 渚濊禆閰嶇疆
鈹?  鈹斺攢鈹€ tauri.conf.json # Tauri 閰嶇疆
鈹溾攢鈹€ src/                # 鍓嶇婧愮爜
鈹?  鈹溾攢鈹€ index.html      # 涓婚〉闈?鈹?  鈹溾攢鈹€ script.js       # 鍓嶇浜や簰閫昏緫
鈹?  鈹斺攢鈹€ style.css       # 鏍峰紡鏂囦欢
鈹溾攢鈹€ tests/              # 娴嬭瘯鏂囦欢
鈹溾攢鈹€ AGENTS.md          # 椤圭洰瑙勮寖
鈹溾攢鈹€ CONTRIBUTING.md    # 鏈础鐚寚鍗?鈹斺攢鈹€ README.md          # 椤圭洰璇存槑
```

### 杩愯娴嬭瘯

```bash
# 杩愯 Rust 娴嬭瘯
cargo test

# 杩愯鍓嶇娴嬭瘯锛堝鏈夛級
npm test
```

## 鎻愪氦瑙勮寖

鎴戜滑閬靛惊[绾﹀畾寮忔彁浜(https://www.conventionalcommits.org/)瑙勮寖锛?
```
<绫诲瀷>[鍙€夎寖鍥碷: <鎻忚堪>

[鍙€夋鏂嘳

[鍙€夎剼娉╙
```

### 绫诲瀷璇存槑

| 绫诲瀷 | 璇存槑 |
|-----|------|
| `feat` | 鏂板姛鑳?|
| `fix` | Bug 淇 |
| `docs` | 鏂囨。鍙樻洿 |
| `style` | 浠ｇ爜鏍煎紡锛堜笉褰卞搷鍔熻兘锛?|
| `refactor` | 浠ｇ爜閲嶆瀯 |
| `perf` | 鎬ц兘浼樺寲 |
| `test` | 娴嬭瘯鐩稿叧 |
| `chore` | 鏋勫缓杩囩▼鎴栬緟鍔╁伐鍏峰彉鏇?|

### 绀轰緥

```
feat(machine-id): 娣诲姞闅忔満鐢熸垚鏈哄櫒鐮佸姛鑳?
- 瀹炵幇闅忔満 GUID 鐢熸垚绠楁硶
- 娣诲姞鏍煎紡楠岃瘉
- 鍖呭惈鍗曞厓娴嬭瘯

Closes #123
```

## 浠ｇ爜瀹℃煡娴佺▼

### Pull Request 瑕佹眰

1. **浠ｇ爜璐ㄩ噺**
   - 閫氳繃鎵€鏈夋祴璇?   - 閫氳繃 Clippy 妫€鏌?   - 浠ｇ爜鏍煎紡姝ｇ‘

2. **鏂囨。瑕佹眰**
   - 鏇存柊鐩稿叧鏂囨。
   - 娣诲姞蹇呰鐨勬敞閲?   - 鏇存柊 CHANGELOG锛堝闇€瑕侊級

3. **鎻愪氦淇℃伅**
   - 浣跨敤娓呮櫚鐨勬彁浜や俊鎭?   - 閬靛惊鎻愪氦瑙勮寖
   - 鍖呭惈鍏宠仈鐨?Issue 缂栧彿

### 瀹℃煡鏍囧噯

- 鍔熻兘姝ｇ‘鎬?- 浠ｇ爜鍙鎬?- 鎬ц兘褰卞搷
- 瀹夊叏鎬?- 鍚戝悗鍏煎鎬?- 娴嬭瘯瑕嗙洊

## 绀惧尯璧勬簮

### 浜ゆ祦娓犻亾
- GitHub Issues锛氱敤浜庢姤鍛婇棶棰樺拰鎻愬嚭寤鸿
- GitHub Discussions锛氱敤浜庝竴鑸璁?
### 鏈夌敤鐨勯摼鎺?- [椤圭洰 Wiki](https://github.com/luxiaosen8/MachineID-Manage/wiki)
- [API 鏂囨。](https://docs.rs/machineid-manage)
- [Tauri 鏂囨。](https://tauri.app/)

---

## 璐＄尞鑰?
鎰熻阿鎵€鏈変负 MachineID-Manage 鍋氬嚭璐＄尞鐨勪汉锛?
<a href="https://github.com/luxiaosen8/MachineID-Manage/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=luxiaosen8/MachineID-Manage" />
</a>

---

## 璁稿彲鍗忚

閫氳繃鍚?MachineID-Manage 椤圭洰璐＄尞浠ｇ爜锛屾偍鍚屾剰鎮ㄧ殑璐＄尞灏嗘寜鐓?[MIT 璁稿彲璇乚(LICENSE) 鐨勬潯娆捐繘琛岃鍙€?
---

**鎰熻阿鎮ㄧ殑璐＄尞锛?*

---

**鏈€鍚庢洿鏂?*锛?025骞?鏈?7鏃?
