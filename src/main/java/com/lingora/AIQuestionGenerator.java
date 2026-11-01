package com.lingora;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AIQuestionGenerator {
    private static final int DAILY_MAX = 175;
    private final ObjectMapper mapper;
    private final HttpClient client;

    public AIQuestionGenerator(ObjectMapper mapper) {
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    }

    public List<PlacementQuestion> generate(String goal, String level, int door, int part, int lesson) {
        if (door == 11) return List.of();
        return generateQuestions(goal, level, door, part, lesson, 10);
    }

    private List<PlacementQuestion> generateQuestions(String goal, String level, int door, int part, int lesson, int count) {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) return List.of();
        try {
            String model = System.getenv().getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
            String prompt = """
                    Bạn là AI tạo bài học tiếng Anh cho ứng dụng Engzi.
                    Tạo đúng %d câu cho Bài %d, Phần %d, Cửa %d.
                    Mục tiêu học: %s. Trình độ: %s.
                    QUAN TRỌNG: bài phải DẠY trước rồi mới luyện. Mỗi bài phải có ít nhất 2-5 từ vựng mới HOẶC 1-2 mẫu câu mới.
                    Câu hỏi phải đa dạng: multiple_choice, fill_blank, reorder, listening, speaking, writing.
                    listening = AI đọc câu, người học nghe và viết lại. speaking = AI đưa tình huống/câu mẫu, người học nói và AI nhận xét.
                    Với speaking/listening vẫn trả answers 4 phần tử để tương thích giao diện; correct có thể là 0.
                    Không lặp nguyên văn câu hỏi. Giải thích bằng tiếng Việt.
                    Trả JSON thuần theo schema:
                    {"lessonTitle":"...","learningContent":"Từ vựng: ... | Mẫu câu: ...","questions":[{"question":"...","answers":["...","...","...","..."],"correct":0,"explanation":"...","topic":"...","type":"multiple_choice"}]}
                    """.formatted(count, lesson, part, door, safe(goal), safe(level));
            String text = callGemini(endpoint, prompt);
            if (text.isBlank()) return List.of();
            JsonNode parsed = mapper.readTree(cleanJson(text));
            JsonNode qs = parsed.path("questions");
            if (!qs.isArray()) return List.of();
            return parseQuestions(qs, count);
        } catch (Exception ignored) { return List.of(); }
    }

    public ObjectNode generateDaily(String goal, String level) {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode lessons = result.putArray("lessons");
        result.put("maxQuestions", DAILY_MAX);
        result.put("questionCount", 0);

        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) return result;
        try {
            String model = System.getenv().getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
            String prompt = """
                    Bạn là AI biên soạn Phần học tiếng Anh hằng ngày cho Engzi.
                    Tạo MỘT Phần mới gồm tối đa 10 bài học. Tổng số câu hỏi của TOÀN BỘ Phần phải từ 1 đến 175, KHÔNG BAO GIỜ vượt 175. Có thể ít hơn 175 nếu nội dung đã đủ.
                    Mục tiêu: %s. Trình độ: %s.
                    Mỗi bài phải có ít nhất 2-5 từ vựng mới HOẶC 1-2 mẫu câu mới; phải ghi rõ trong learningContent.
                    Số câu của từng bài KHÔNG cần bằng nhau và KHÔNG bắt buộc 10 câu. Các bài phải có câu hỏi khác nhau, không lặp nguyên văn.
                    Trộn các dạng: multiple_choice, fill_blank, reorder, listening, speaking, writing, conversation.
                    listening: AI đọc một câu tiếng Anh, người học nghe rồi viết lại.
                    speaking: AI đưa câu/tình huống, người học nói; hệ thống sẽ nhận giọng nói và AI nhận xét.
                    writing: chấp nhận nhiều cách diễn đạt hợp lý, không quá cứng nhắc.
                    Mỗi câu có 4 answers để tương thích giao diện; với listening/speaking/writing có thể để 4 đáp án gợi ý.
                    JSON thuần, không markdown:
                    {"title":"...","lessons":[{"title":"...","learningContent":"Từ vựng: ... | Mẫu câu: ...","questions":[{"question":"...","answers":["...","...","...","..."],"correct":0,"explanation":"...","topic":"...","type":"multiple_choice"}]}]}
                    """.formatted(safe(goal), safe(level));
            JsonNode parsed = mapper.readTree(cleanJson(callGemini(endpoint, prompt)));
            JsonNode sourceLessons = parsed.path("lessons");
            if (!sourceLessons.isArray()) return result;

            int total = 0;
            Set<String> seen = new HashSet<>();
            int lessonNo = 0;
            for (JsonNode lesson : sourceLessons) {
                if (lessonNo >= 10 || total >= DAILY_MAX) break;
                ArrayNode outQuestions = mapper.createArrayNode();
                JsonNode sourceQuestions = lesson.path("questions");
                if (!sourceQuestions.isArray()) continue;
                for (JsonNode q : sourceQuestions) {
                    if (total >= DAILY_MAX) break;
                    String questionText = q.path("question").asText("").trim();
                    if (questionText.isBlank() || !seen.add(questionText.toLowerCase())) continue;
                    JsonNode answers = q.path("answers");
                    if (!answers.isArray() || answers.size() != 4) continue;
                    int correct = q.path("correct").asInt(0);
                    if (correct < 0 || correct > 3) correct = 0;
                    ObjectNode clean = mapper.createObjectNode();
                    clean.put("id", total + 1);
                    clean.put("question", questionText);
                    ArrayNode a = clean.putArray("answers");
                    for (int i=0;i<4;i++) a.add(answers.get(i).asText(""));
                    clean.put("correct", correct);
                    clean.put("explanation", q.path("explanation").asText("Hãy xem lại câu và ngữ cảnh."));
                    clean.put("topic", q.path("topic").asText("AI • Luyện tập"));
                    clean.put("type", q.path("type").asText("multiple_choice"));
                    outQuestions.add(clean);
                    total++;
                }
                if (outQuestions.isEmpty()) continue;
                ObjectNode outLesson = lessons.addObject();
                outLesson.put("lesson", ++lessonNo);
                outLesson.put("title", lesson.path("title").asText("Bài học AI " + lessonNo));
                outLesson.put("learningContent", lesson.path("learningContent").asText("Từ vựng và mẫu câu thực hành"));
                outLesson.set("questions", outQuestions);
            }
            result.put("title", parsed.path("title").asText("Phần AI hôm nay"));
            result.put("questionCount", total);
            return result;
        } catch (Exception ignored) { return result; }
    }

    private String callGemini(String endpoint, String prompt) throws Exception {
        ObjectNode root = mapper.createObjectNode();
        ArrayNode contents = root.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put("text", prompt);
        ObjectNode config = root.putObject("generationConfig");
        config.put("temperature", 0.9);
        config.put("responseMimeType", "application/json");
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(root))).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) return "";
        JsonNode rootResponse = mapper.readTree(response.body());
        return rootResponse.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
    }

    private List<PlacementQuestion> parseQuestions(JsonNode questions, int count) {
        List<PlacementQuestion> result = new ArrayList<>();
        for (JsonNode q : questions) {
            JsonNode answers = q.path("answers");
            int correct = q.path("correct").asInt(-1);
            if (!q.path("question").isTextual() || !answers.isArray() || answers.size() != 4 || correct < 0 || correct > 3) continue;
            String[] options = new String[4];
            for (int i=0;i<4;i++) options[i] = answers.get(i).asText("");
            PlacementQuestion item = new PlacementQuestion(result.size()+1, q.path("question").asText(), options, correct, q.path("explanation").asText("Hãy xem lại câu và ngữ cảnh."), q.path("difficulty").asText("AI"), q.path("topic").asText("AI • Luyện tập"));
            item.setType(q.path("type").asText("multiple_choice"));
            item.setLearningContent(q.path("learningContent").asText(""));
            result.add(item);
            if (result.size() == count) break;
        }
        return result.size() == count ? result : List.of();
    }

    private static String cleanJson(String text) {
        String value = text == null ? "" : text.trim();
        if (value.startsWith("```")) {
            value = value.replaceFirst("^```(?:json)?\\s*", "");
            value = value.replaceFirst("\\s*```$", "");
        }
        return value.trim();
    }

    private static String safe(String value) { return value == null || value.isBlank() ? "tổng quát" : value; }
}
