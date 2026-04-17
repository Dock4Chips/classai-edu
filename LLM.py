"""
调用 Ollama Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled 示例
"""

# BASE_URL = "https://model-world.vip.cpolar.cn"
# MODEL = "kwangsuklee/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-GGUF:latest"


import requests
import json

BASE_URL = "http://175.27.242.42:6003"
# MODEL = "llama3.1:8b"
MODEL = "gemma3:4b"
# MODEL = "qwen3.5:9b"

def chat(prompt: str, stream: bool = True):
    """发送聊天请求"""
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": stream,
    }

    if stream:
        with requests.post(f"{BASE_URL}/api/chat", json=payload, stream=True) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content", "")
                    if content:
                        print(content, end="", flush=True)
                    if data.get("done"):
                        print()
                        return data
    else:
        resp = requests.post(f"{BASE_URL}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
        print(data["message"]["content"])
        return data


if __name__ == "__main__":
    print(f"模型: {MODEL}\n")
    chat("用 Python 写一个快速排序，并解释时间复杂度")