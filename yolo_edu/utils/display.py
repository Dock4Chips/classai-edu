import cv2

def show_cv2_img(img,win_name="show_cv2_img"):
    if img is None:
        raise ValueError("图像为空")
    cv2.imshow(win_name, img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def show_cv2_cap(cap: cv2.VideoCapture, win_name="show_cv2_cap", quit_key="q", delay=1):
    if not cap.isOpened():
        raise ValueError("VideoCapture 未打开")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow(win_name, frame)
        if cv2.waitKey(delay) & 0xFF == ord(quit_key):
            break
    cap.release()
    cv2.destroyAllWindows()

def show_cv2_frames(frames, win_name="show_cv2_frames", quit_key="q", delay=1):
    if frames is None or len(frames) == 0:
        raise ValueError("frames 为空")
    for frame in frames:
        cv2.imshow(win_name, frame)
        if cv2.waitKey(delay) & 0xFF == ord(quit_key):
            break
    cv2.destroyAllWindows()
