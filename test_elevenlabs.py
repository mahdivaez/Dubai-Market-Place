from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="sk_64cdcdb4b59bdfbf83d4b3acc072e9c11780cb58d51c2fbe")

with open("post_1_video.mp4", "rb") as f:
    transcription = client.speech_to_text.convert(
        file=f,
        model_id="scribe_v1"
    )

print("✅ Transcription:")
print(transcription.text)

with open("post_1_video.txt", "w", encoding="utf-8") as out:
    out.write(transcription.text)
