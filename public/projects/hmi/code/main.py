import os
# TensorFlow uyarılarını tamamen susturur
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import mediapipe as mp
import time
import threading
import random
from matrix_bridge import MatrixBridge
import string
import smtplib
import glob
import pyttsx3  
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ==========================================
# 1. AYARLAR VE RENK PALETİ
# ==========================================
SENDER_MAIL = os.environ.get("CALC_SENDER_MAIL")       # Maili gönderecek sistem hesabı (ortam değişkeninden okunur)
MAIL_PASSWORD = os.environ.get("CALC_MAIL_PASSWORD")   # Google Uygulama Şifresi (ortam değişkeninden okunur, koda yazılmaz)
DB_PATH = "database"                                    # Admin fotoğraflarının olduğu klasör

# Tanımlı admin e-posta ve isim sözlüğü
ADMINS = {
    "ADMIN 1": {"mail": os.environ.get("ADMIN1_MAIL", ""), "real_name": "ONUR BILGIN", "prefix": "admin1"},
    "ADMIN 2": {"mail": os.environ.get("ADMIN2_MAIL", ""), "real_name": "FURKAN OZBEK", "prefix": "admin2"}
}

WIN_W, WIN_H = 1280, 720
DWELL_TIME = 2.0
FONT_STYLE = cv2.FONT_HERSHEY_DUPLEX

# Renk Paleti
CLR_BTN = (60, 60, 60); CLR_HOV = (200, 150, 50); CLR_OP = (100, 60, 60)
CLR_EQ = (40, 160, 70); CLR_CLR = (50, 50, 160); CLR_TEXT = (240, 240, 240)
CLR_BAR = (50, 220, 100); ALPHA = 0.65
CLR_SILIK = (100, 100, 100); CLR_PARLAK = (50, 255, 50)

# ==========================================
# 2. TÜRKÇE SES MOTORU AYIKLAMA MANTIĞI
# ==========================================
def speak(text):
    def _speak_thread(t):
        try:
            engine = pyttsx3.init()
            voices = engine.getProperty('voices')
            
            # Find English voice
            english_voice_found = False
            for voice in voices:
                if "english" in voice.name.lower() or "en" in voice.id.lower() or "zira" in voice.name.lower() or "david" in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    english_voice_found = True
                    break
            
            # Fallback to first available voice
            if not english_voice_found and len(voices) > 0:
                engine.setProperty('voice', voices[0].id)
                
            engine.setProperty('rate', 145) # Anlaşılır ve net bir konuşma hızı
            engine.say(t)
            engine.runAndWait()
        except Exception as e:
            print("Ses motoru hatası:", e)
    threading.Thread(target=_speak_thread, args=(text,), daemon=True).start()

# ==========================================
# 3. ARAYÜZ VE TUŞ MATRİSİ KOORDİNATLARI
# ==========================================
# <- işareti yerine DEL yazısı matrise entegre edildi
# Düzen:
# [ 7 ] [ 8 ] [ 9 ] [ / ]
# [ 4 ] [ 5 ] [ 6 ] [ * ]
# [ 1 ] [ 2 ] [ 3 ] [ - ]
# [ C ] [ 0 ] [DEL] [ + ]
# [    OKU    ]     [ = ]

BTN_W, BTN_H, BTN_GAP = 90, 62, 8
GRID_W = 4 * BTN_W + 3 * BTN_GAP
GRID_H = 5 * BTN_H + 4 * BTN_GAP
GRID_X = (WIN_W - GRID_W) // 2
GRID_Y = (WIN_H - GRID_H) // 2 + 20
DISP_W, DISP_H = GRID_W, 55
DISP_X, DISP_Y = GRID_X, GRID_Y - 65
EXPR_W, EXPR_H = GRID_W, 30
EXPR_X, EXPR_Y = GRID_X, DISP_Y - 35

# Satır 0-3: standart 4 sütunlu ızgara
_ROWS = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["C", "0", "DEL", "+"],
]
btn_rects = {}
for ri, row in enumerate(_ROWS):
    for ci, lbl in enumerate(row):
        btn_rects[lbl] = (GRID_X + ci * (BTN_W + BTN_GAP), GRID_Y + ri * (BTN_H + BTN_GAP), BTN_W, BTN_H)

# Satır 4: OKU (3 tuş genişliği) + = (1 tuş genişliği)
_row4_y = GRID_Y + 4 * (BTN_H + BTN_GAP)
_oku_w  = 3 * BTN_W + 2 * BTN_GAP   # C + 0 + DEL genişliği
_eq_w   = BTN_W                      # + genişliği
btn_rects["OKU"] = (GRID_X,              _row4_y, _oku_w, BTN_H)
btn_rects["="]   = (GRID_X + _oku_w + BTN_GAP, _row4_y, _eq_w,  BTN_H)

admin_btn_rects = {
    "ADMIN 1": (30, 30, 380, 65),       
    "ADMIN 2": (WIN_W - 410, 30, 380, 65)  
}

# ==========================================
# 4. YARDIMCI ÇİZİM FONKSİYONLARI
# ==========================================
def orect(cv_img, x, y, w, h, color, alpha=ALPHA, r=10):
    ov = cv_img.copy()
    cv2.rectangle(ov, (x+r, y), (x+w-r, y+h), color, -1)
    cv2.rectangle(ov, (x, y+r), (x+w, y+h-r), color, -1)
    for cx, cy in [(x+r, y+r), (x+w-r, y+r), (x+r, y+h-r), (x+w-r, y+h-r)]:
        cv2.circle(ov, (cx, cy), r, color, -1)
    cv2.addWeighted(ov, alpha, cv_img, 1 - alpha, 0, cv_img)

def ptc(cv_img, txt, cx, cy, sc, col, th=1):
    (tw, th2), _ = cv2.getTextSize(txt, FONT_STYLE, sc, th)
    cv2.putText(cv_img, txt, (cx - tw//2, cy + th2//2), FONT_STYLE, sc, col, th, cv2.LINE_AA)

def btn_color(lbl, hov):
    if hov: return CLR_HOV
    if lbl in "+-*/": return CLR_OP
    if lbl == "=": return CLR_EQ
    if lbl in ["C", "DEL"]: return CLR_CLR
    if lbl == "OKU": return (130, 80, 20) 
    return CLR_BTN

# ==========================================
# 5. GÜVENLİK ARKA PLAN MAİL THREAD İ
# ==========================================
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.8, min_tracking_confidence=0.8)
qr_detector = cv2.QRCodeDetector()

sec_state = "IDLE"  
sec_msg = ""
current_dynamic_token = ""  
selected_admin_name = ""
selected_admin_mail = ""
selected_real_name = ""
is_email_sending = False

admin1_active = False
admin2_active = False
welcome_mode = False
welcome_start_time = 0
loaded_admin_image = None

def send_qr_email_thread(token, receiver_mail, admin_name, real_name):
    global sec_state, sec_msg, is_email_sending
    is_email_sending = True
    try:
        qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={token}"
        
        msg = MIMEMultipart()
        msg['From'] = SENDER_MAIL
        msg['To'] = receiver_mail.strip()
        msg['Subject'] = f"MIMARI GUVENLIK - TARGETED OTP TOKEN [{real_name}]"
        
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Sistem Kilit Açma İsteği Tetiklendi!</h2>
            <p>Sayın Yetkili (<b>{real_name}</b>),</p>
            <p>Aşağıdaki dinamik QR kodu bilgisayar kamerasına göstererek admin yetkinizi doğrulayabilirsiniz.</p>
            <br>
            <img src="{qr_api_url}" width="250" height="250" alt="QR Token">
            <br><br>
            <p><b>Geçici Güvenlik Metni:</b> <span style="font-size: 18px; color: #1565c0; font-weight: bold;">{token}</span></p>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=15)
        server.starttls()
        server.login(SENDER_MAIL, MAIL_PASSWORD)
        server.sendmail(SENDER_MAIL, receiver_mail.strip(), msg.as_string())
        server.quit()
        
        sec_state = "WAITING_QR" 
    except Exception as e:
        sec_state = "ERROR"
        sec_msg = "MAIL GONDERILEMEDI!"
        threading.Timer(3.0, lambda: globals().update(sec_state="IDLE", current_mode="CALCULATOR")).start()
    finally:
        is_email_sending = False

# ==========================================
# 6. ANA KAMERA VE ARAYÜZ DÖNGÜSÜ
# ==========================================
# Üniversite logosu yükle ve boyutlandır
_raw_logo = cv2.imread("uni_logo.png")
if _raw_logo is not None:
    _logo_h = 130
    _logo_ratio = _raw_logo.shape[1] / _raw_logo.shape[0]
    _logo_w = int(_logo_h * _logo_ratio)
    uni_logo_img = cv2.resize(_raw_logo, (_logo_w, _logo_h), interpolation=cv2.INTER_LANCZOS4)
else:
    uni_logo_img = None

# Arduino dot matrix başlat
matrix = MatrixBridge()  # port=None → otomatik algıla
if matrix.connected:
    matrix.send_message('AR CALCULATOR READY')

cap = cv2.VideoCapture(0)
cv2.namedWindow("AR Hesap Makinesi", cv2.WINDOW_NORMAL)
cv2.setWindowProperty("AR Hesap Makinesi", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

display_text = ""
current_mode = "CALCULATOR" 
hov_lbl = None
dwell_start = None

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break
    frame = cv2.flip(frame, 1)
    
    fh, fw = frame.shape[:2]
    scale = max(WIN_W / fw, WIN_H / fh)
    nw, nh = int(fw * scale), int(fh * scale)
    ox, oy = (nw - WIN_W) // 2, (nh - WIN_H) // 2
    
    scaled = cv2.resize(frame, (nw, nh))
    canvas = scaled[oy:oy + WIN_H, ox:ox + WIN_W].copy()
    rgb_canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
    
    # Ortak El İzleme
    results_hands = hands.process(rgb_canvas)
    cx, cy = -1, -1
    if results_hands.multi_hand_landmarks:
        for hand_landmarks in results_hands.multi_hand_landmarks:
            cx = int(hand_landmarks.landmark[8].x * WIN_W)
            cy = int(hand_landmarks.landmark[8].y * WIN_H)
            cv2.circle(canvas, (cx, cy), 15, (255, 255, 255), 2)
            cv2.circle(canvas, (cx, cy), 5, (0, 200, 255), -1)

    # --- SABİT ÜNİVERSİTE LOGO FOTOĞRAFI ---
    if uni_logo_img is not None:
        uw, uh = uni_logo_img.shape[1], uni_logo_img.shape[0]
        ux = (WIN_W - uw) // 2
        uy = 10
        canvas[uy:uy+uh, ux:ux+uw] = uni_logo_img

    # ====================================================
    # 📌 FOTOĞRAFLI HOŞGELDİNİZ EKRANI MODU
    # ====================================================
    if welcome_mode:
        ov = canvas.copy()
        cv2.rectangle(ov, (0, 0), (WIN_W, WIN_H), (10, 10, 10), -1)
        cv2.addWeighted(ov, 0.70, canvas, 0.30, 0, canvas)
        
        ptc(canvas, f"{selected_real_name} HOSGELDINIZ", WIN_W // 2, WIN_H // 2 - 200, 1.2, (50, 255, 50), th=3)
        ptc(canvas, "SISTEM AKTIF EDILDI", WIN_W // 2, WIN_H // 2 - 150, 0.7, (200, 200, 200), th=2)
        
        if loaded_admin_image is not None:
            iw, ih = 260, 260
            ix_pos = (WIN_W - iw) // 2
            iy_pos = (WIN_H - ih) // 2 - 20
            cv2.rectangle(canvas, (ix_pos - 5, iy_pos - 5), (ix_pos + iw + 5, iy_pos + ih + 5), (255, 255, 255), 3, cv2.LINE_AA)
            canvas[iy_pos:iy_pos+ih, ix_pos:ix_pos+iw] = loaded_admin_image
            
        gecen_sure = time.time() - welcome_start_time
        kalan_oran = max(0.0, min(1.0, gecen_sure / 4.0))
        bar_w = 400
        bx_bar = (WIN_W - bar_w) // 2
        by_bar = WIN_H // 2 + 180
        orect(canvas, bx_bar, by_bar, bar_w, 12, (40, 40, 40), alpha=0.8, r=4)
        orect(canvas, bx_bar, by_bar, int(bar_w * kalan_oran), 12, CLR_BAR, alpha=0.95, r=4)

        if gecen_sure >= 4.0:
            welcome_mode = False
            current_mode = "CALCULATOR"
            display_text = f"{selected_real_name} OK"
            def _clear_ok_text():
                global display_text
                time.sleep(2.0)
                if display_text.endswith(" OK"):
                    display_text = ""
            threading.Thread(target=_clear_ok_text, daemon=True).start()
            
        cv2.imshow("AR Hesap Makinesi", canvas)
        cv2.waitKey(1)
        continue

    # ----------------------------------------------------
    # MOD 1: AR HESAP MAKİNESİ MODU
    # ----------------------------------------------------
    if current_mode == "CALCULATOR":
        cur_hov = None
        if cx != -1 and cy != -1:
            for lbl, (bx, by, bw, bh) in btn_rects.items():
                if bx <= cx <= bx + bw and by <= cy <= by + bh:
                    cur_hov = lbl
                    break

        if cur_hov != hov_lbl:
            hov_lbl = cur_hov
            dwell_start = time.time() if cur_hov else None
        elif hov_lbl and dwell_start:
            el = time.time() - dwell_start
            ratio = min(el / DWELL_TIME, 1.0)
            
            if el >= DWELL_TIME:
                if hov_lbl == "C": 
                    display_text = ""
                elif hov_lbl == "DEL":
                    if display_text and display_text != "ERROR":
                        display_text = display_text[:-1]
                elif hov_lbl == "OKU": 
                    if display_text == "":
                        speak("Screen is empty")
                    elif display_text == "ERROR":
                        speak("An error occurred")
                    else:
                        okuma_metni = display_text.replace("+", " plus ").replace("-", " minus ").replace("*", " times ").replace("/", " divided by ")
                        speak(okuma_metni)
                elif hov_lbl == "=":
                    if display_text == "2015": 
                        current_mode = "ADMIN_SELECT" 
                        display_text = ""
                        speak("Security mode activated. Please select the admin to notify.") 
                    else:
                        try: 
                            expr_before = display_text
                            sonuc = str(eval(display_text))
                            display_text = sonuc
                            if matrix.connected:
                                threading.Thread(
                                    target=matrix.calculator_result,
                                    args=(expr_before, sonuc),
                                    daemon=True
                                ).start()
                        except: 
                            display_text = "ERROR"
                else:
                    if display_text == "ERROR": display_text = ""
                    display_text += hov_lbl
                
                hov_lbl = None
                dwell_start = None
                time.sleep(0.3)

        # Hesap Makinesi Çizimleri
        orect(canvas, DISP_X, DISP_Y, DISP_W, DISP_H, (10, 10, 10), alpha=0.80)
        (tw, th2), _ = cv2.getTextSize(display_text, FONT_STYLE, 1.8, 2)
        cv2.putText(canvas, display_text, (DISP_X + DISP_W - tw - 12, DISP_Y + DISP_H // 2 + th2 // 2), FONT_STYLE, 1.8, CLR_TEXT, 2, cv2.LINE_AA)

        for lbl, (bx, by, bw, bh) in btn_rects.items():
            hov = (lbl == hov_lbl)
            orect(canvas, bx, by, bw, bh, btn_color(lbl, hov), alpha=0.88 if hov else ALPHA)
            ptc(canvas, lbl, bx + bw // 2, by + bh // 2, 0.9 if lbl == "OKU" else 1.0, CLR_TEXT)

        # Bekleme barı - butonların üzerinde (ön planda)
        if hov_lbl and dwell_start:
            el = time.time() - dwell_start
            ratio = min(el / DWELL_TIME, 1.0)
            by_bar = EXPR_Y + EXPR_H + 6
            orect(canvas, DISP_X, by_bar, DISP_W, 18, (20, 20, 20), alpha=0.85, r=6)
            bw2 = int(DISP_W * ratio)
            if bw2 > 10:
                orect(canvas, DISP_X, by_bar, bw2, 18, CLR_BAR, alpha=1.0, r=6)
            # Yüzde yazısı
            pct_txt = f"{int(ratio*100)}%"
            ptc(canvas, pct_txt, DISP_X + DISP_W // 2, by_bar + 9, 0.45, (255, 255, 255), th=1)

    # ----------------------------------------------------
    # MOD 2: ADMİN SEÇİM MODU
    # ----------------------------------------------------
    elif current_mode == "ADMIN_SELECT":
        ov = canvas.copy()
        cv2.rectangle(ov, (0, 0), (WIN_W, WIN_H), (80, 40, 40), -1) 
        cv2.addWeighted(ov, 0.35, canvas, 0.65, 0, canvas)

        ptc(canvas, "GIZLI MOD AKTIF - LUTFEN BILDIRIM GONDERILECEK ADMINI SECIN", WIN_W//2, WIN_H//2, 0.75, (0, 255, 255), th=2)

        cur_hov = None
        if cx != -1 and cy != -1:
            for admin_name, (bx, by, bw, bh) in admin_btn_rects.items():
                if bx <= cx <= bx + bw and by <= cy <= by + bh:
                    cur_hov = admin_name
                    break

        if cur_hov != hov_lbl:
            hov_lbl = cur_hov
            dwell_start = time.time() if cur_hov else None
        elif hov_lbl and dwell_start:
            el = time.time() - dwell_start
            ratio = min(el / DWELL_TIME, 1.0)
            
            bx, by, bw, bh = admin_btn_rects[hov_lbl]
            orect(canvas, bx, by + bh + 4, bw, 6, (40, 40, 40), alpha=0.7, r=2)
            bw2 = int(bw * ratio)
            if bw2 > 5:
                orect(canvas, bx, by + bh + 4, bw2, 6, CLR_BAR, alpha=0.9, r=2)

            if el >= DWELL_TIME and not is_email_sending:
                selected_admin_name = hov_lbl
                selected_admin_mail = ADMINS[hov_lbl]["mail"]
                selected_real_name = ADMINS[hov_lbl]["real_name"]
                
                current_mode = "SECURITY"
                sec_state = "SENDING_MAIL"
                if matrix.connected:
                    threading.Thread(target=matrix.security_mode, daemon=True).start()
                
                current_dynamic_token = "".join(random.choices(string.ascii_uppercase + string.digits, k=12))
                
                t = threading.Thread(target=send_qr_email_thread, args=(current_dynamic_token, selected_admin_mail, selected_admin_name, selected_real_name))
                t.daemon = True 
                t.start()
                
                hov_lbl = None
                dwell_start = None
                time.sleep(0.3)

        for admin_name, (bx, by, bw, bh) in admin_btn_rects.items():
            hov = (admin_name == hov_lbl)
            orect(canvas, bx, by, bw, bh, CLR_HOV if hov else CLR_BTN, alpha=0.95)
            ptc(canvas, admin_name, bx + bw // 2, by + bh // 2, 0.75, CLR_TEXT, th=2)
            
            real_name = ADMINS[admin_name]["real_name"]
            ptc(canvas, real_name, bx + bw // 2, by + bh + 25, 0.55, CLR_SILIK, th=1)

    # ----------------------------------------------------
    # MOD 3: GÜVENLİK MODU (2FA QR DOĞRULAMA)
    # ----------------------------------------------------
    elif current_mode == "SECURITY":
        ov = canvas.copy()
        cv2.rectangle(ov, (0, 0), (WIN_W, WIN_H), (150, 50, 0), -1) 
        cv2.addWeighted(ov, 0.25, canvas, 0.75, 0, canvas)

        bw_sec, bh_sec = 580, 72
        bx_sec = (WIN_W - bw_sec) // 2
        orect(canvas, bx_sec, 16, bw_sec, bh_sec, (160, 40, 10), alpha=0.95, r=14)
        ptc(canvas, "TARGETED QR VERIFICATION", bx_sec + bw_sec // 2, 52, 1.1, (255, 255, 255))

        for admin_name, (bx, by, bw, bh) in admin_btn_rects.items():
            is_target = (admin_name == selected_admin_name)
            orect(canvas, bx, by, bw, bh, (20, 20, 20) if is_target else (10, 10, 10), alpha=0.5, r=8)
            ptc(canvas, admin_name, bx + bw // 2, by + bh // 2, 0.6, CLR_TEXT if is_target else CLR_SILIK, th=1)
            ptc(canvas, ADMINS[admin_name]["real_name"], bx + bw // 2, by + bh + 25, 0.55, CLR_PARLAK if (is_target and sec_state == "SUCCESS") else CLR_SILIK, th=2 if is_target else 1)

        if sec_state == "SENDING_MAIL":
            ptc(canvas, "QR TOKEN SECILEN ADMINE POSTALANIYOR...", WIN_W//2, WIN_H//2, 0.85, (0, 255, 255), th=2)

        elif sec_state == "WAITING_QR":
            ptc(canvas, "GELEN QR KODU TELEFONUNUZDAN KAMERAYA GOSTERIN", WIN_W//2, WIN_H//2, 0.75, (0, 255, 0), th=2)
            
            data, points, _ = qr_detector.detectAndDecode(canvas)
            if points is not None and data != "":
                pts = points[0].astype(int)
                for i in range(len(pts)):
                    cv2.line(canvas, tuple(pts[i]), tuple(pts[(i+1)%len(pts)]), (0, 255, 0), 3)
                
                if data == current_dynamic_token:
                    sec_state = "SUCCESS"
                    
                    if matrix.connected:
                        _rn = selected_real_name
                        threading.Thread(
                            target=matrix.welcome_admin,
                            args=(_rn,),
                            daemon=True
                        ).start()
                    # Dinamik Türkçe Seslendirme
                    speak(f"Welcome {selected_real_name}. Login successful.")
                    
                    prefix = ADMINS[selected_admin_name]["prefix"]
                    search_pattern = os.path.join(DB_PATH, f"{prefix}_*.jpg")
                    found_images = glob.glob(search_pattern)
                    
                    loaded_admin_image = None
                    if found_images:
                        raw_img = cv2.imread(found_images[0])
                        if raw_img is not None:
                            loaded_admin_image = cv2.resize(raw_img, (260, 260))
                    
                    welcome_mode = True
                    welcome_start_time = time.time()
                else:
                    sec_state = "ERROR"
                    sec_msg = "YETKISIZ KISI TESPIT EDILDI"
                    speak("Unauthorized person detected")
                    if matrix.connected:
                        threading.Thread(target=matrix.unauthorized, daemon=True).start()
                    def _back_to_calc():
                        globals().update(sec_state="IDLE", current_mode="CALCULATOR",
                                         welcome_mode=False, display_text="")
                    threading.Timer(3.0, _back_to_calc).start()

        elif sec_state == "ERROR":
            # Kırmızı yarı-saydam arka plan
            ov2 = canvas.copy()
            cv2.rectangle(ov2, (0, 0), (WIN_W, WIN_H), (0, 0, 180), -1)
            cv2.addWeighted(ov2, 0.45, canvas, 0.55, 0, canvas)
            # Uyarı kutusu
            bw_err, bh_err = 820, 90
            bx_err = (WIN_W - bw_err) // 2
            by_err = WIN_H // 2 - bh_err // 2
            orect(canvas, bx_err, by_err, bw_err, bh_err, (0, 0, 150), alpha=0.95, r=14)
            ptc(canvas, sec_msg, WIN_W // 2, WIN_H // 2, 1.2, (0, 0, 255), th=3)
            # İkinci satır
            ptc(canvas, "CALCULATOR MODE RETURNING...", WIN_W // 2, WIN_H // 2 + 55, 0.65, (200, 200, 200), th=2)

    cv2.imshow("AR Hesap Makinesi", canvas)
    
    key = cv2.waitKey(1) & 0xFF
    if key == 27 or key == ord('q'):
        break
    elif key == ord('r'): 
        current_mode = "CALCULATOR"
        display_text = ""
        sec_state = "IDLE"
        welcome_mode = False

cap.release()
cv2.destroyAllWindows()
matrix.close()