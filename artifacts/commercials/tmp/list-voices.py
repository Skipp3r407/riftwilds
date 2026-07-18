import asyncio
import edge_tts


async def main():
    voices = await edge_tts.list_voices()
    males = [
        v
        for v in voices
        if v["Locale"].startswith("en-") and v["Gender"] == "Male"
    ]
    for v in sorted(males, key=lambda x: x["ShortName"]):
        print(f"{v['ShortName']:42} {v['Locale']:8} {v.get('FriendlyName', '')}")


asyncio.run(main())
