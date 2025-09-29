import axios from 'axios';

// 音色ID列表
const VOICE_LIST = [
    "F24_PB_1126_01",
    "F1029_PB_1128",
    "Female_shaonv_platform",
    "gxf_01_1220",
    "Female_ shangshen_platform",
    "audiobook_m_0413",
    "badao_zongcai",
    "Male_kongchen_platform",
    "zhaimiao_zhouzishu_test0411",
    "ximalaya_male_1_fast",
    // ... 添加其他音色ID
].join('\n');

const LLM_API_URL = `https://api.minimax.chat/v1/text/chatcompletion_pro?GroupId=${process.env.LLM_GROUP_ID}`;

/**
 * 根据角色档案选择一个合适的音色ID
 * @param characterProfile 角色档案/描述文本
 * @returns 返回一个音色ID字符串
 */
export async function selectVoiceForCharacter(characterProfile: string): Promise<string> {
    const prompt = `你是语音音色选择专家。这是角色档案：{${characterProfile}}，你需要根据角色档案，自己选择最合适的音色，以下是列表：\n${VOICE_LIST}\n你只输出音色 ID，除此以外什么也不输出，不输出任何你的思考内容，和任何前缀。`;

    try {
        const response = await axios.post(
            LLM_API_URL,
            {
                model: "abab6-chat",
                tokens_to_generate: 30,
                temperature: 0.01,
                messages: [{ sender_type: "USER", text: prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const voiceId = response.data?.choices?.[0]?.message?.text.trim();

        if (!voiceId || !VOICE_LIST.includes(voiceId)) {
            console.error("LLM未能返回有效的Voice ID，将使用默认音色。返回内容:", voiceId);
            return "male-qn-jingying-jingpin"; 
        }

        console.log(`为角色选择了音色: ${voiceId}`);
        return voiceId;

    } catch (error: any) {
        console.error("调用LLM选择音色时出错:", error);
        return "male-qn-jingying-jingpin"; 
    }
}
