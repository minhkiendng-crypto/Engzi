package com.lingora;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ai")
public class AIQuestionController {
    private final AIQuestionGenerator generator;

    public AIQuestionController(AIQuestionGenerator generator) { this.generator = generator; }

    @PostMapping("/questions")
    public ResponseEntity<?> questions(@RequestBody Request request) {
        List<PlacementQuestion> questions = generator.generate(request.goal(), request.level(), request.door(), request.part(), request.lesson());
        if (questions.size() != 10) return ResponseEntity.status(503).body(new ErrorResponse("AI chưa sẵn sàng. Engzi sẽ dùng bộ câu hỏi dự phòng."));
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/daily")
    public ResponseEntity<?> daily(@RequestBody DailyRequest request) {
        return ResponseEntity.ok(generator.generateDaily(request.goal(), request.level()));
    }

    public record Request(String goal, String level, int door, int part, int lesson) {}
    public record DailyRequest(String goal, String level) {}
    public record ErrorResponse(String message) {}
}
