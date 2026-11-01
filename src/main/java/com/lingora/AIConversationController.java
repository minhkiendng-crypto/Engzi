package com.lingora;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ai")
public class AIConversationController {
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();

    public AIConversationController(ObjectMapper mapper) { this.mapper = mapper; }

    @PostMapping("/conversation")
    public ResponseEntity<?> conversation(@RequestBody Request req) {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.isBlank()) return ResponseEntity.status(503).body(new ErrorResponse("Chưa có GEMINI_API_KEY."));
        try {
            String model = System.getenv().getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
            String persona = req.persona() == null || req.persona().isBlank() ? "một người bạn thân thiện" : req.persona();
            String level = req.level() == null || req.level().isBlank() ? "A1" : req.level();
            String goal = req.goal() == null || req.goal().isBlank() ? "giao tiếp" : req.goal();
            String history = req.history() == null ? "[]" : mapper.writeValueAsString(req.history());
            String prompt = """
                    Bạn là nhân vật AI trong ứng dụng học tiếng Anh Engzi.
                    Vai trò nhân vật: %s
                    Trình độ người học: %s
                    Mục tiêu: %s
                    Nhiệm vụ: tiếp tục hội thoại tự nhiên bằng tiếng Anh, phù hợp trình độ.
                    Nếu người học mắc lỗi, vẫn trả lời tự nhiên nhưng thêm sửa lỗi ngắn bằng tiếng Việt.
                    Khuyến khích người học trả lời tiếp bằng một câu hỏi ngắn.
                    Không bịa kiến thức nguy hiểm. Không nói dài.
                    Lịch sử hội thoại JSON: %s
                    Tin nhắn mới: %s
                    Chỉ trả JSON: {"reply":"...","correction":"...","translation":"...","followUp":"..."}
                    correction để chuỗi rỗng nếu không có lỗi; translation là nghĩa tiếng Việt ngắn gọn.
                    """.formatted(persona, level, goal, history, req.message() == null ? "" : req.message());

            ObjectNode root = mapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            content.putArray("parts").addObject().put("text", prompt);
            ObjectNode config = root.putObject("generationConfig");
            config.put("temperature", 0.75);
            config.put("responseMimeType", "application/json");

            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(root)))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return ResponseEntity.status(502).body(new ErrorResponse("Gemini không phản hồi. Mã: " + response.statusCode()));
            }
            JsonNode body = mapper.readTree(response.body());
            String text = body.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("").trim();
            if (text.startsWith("```")) text = text.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim();
            JsonNode json = mapper.readTree(text);
            return ResponseEntity.ok(new Reply(
                    json.path("reply").asText("Let's keep practicing!"),
                    json.path("correction").asText(""),
                    json.path("translation").asText(""),
                    json.path("followUp").asText("")));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(new ErrorResponse("Không thể kết nối Gemini lúc này."));
        }
    }

    public record Request(String persona, String level, String goal, String message, List<History> history) {}
    public record History(String role, String text) {}
    public record Reply(String reply, String correction, String translation, String followUp) {}
    public record ErrorResponse(String message) {}
}
