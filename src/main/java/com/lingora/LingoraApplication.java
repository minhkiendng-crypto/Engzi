package com.lingora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api")
public class LingoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(LingoraApplication.class, args);
    }

    // Kiểm tra server
    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of(
            "app", "Engzi",
            "message", "Engzi đang chạy!"
        );
    }

    // Trạng thái người học
    @GetMapping("/state")
    public Map<String, Object> state() {
        return Map.of(
            "hearts", 5,
            "streak", 0,
            "xp", 0,
            "level", 1,
            "lesson", 1,
            "goal", "communication"
        );
    }

    // Chọn mục tiêu học
    @PostMapping("/goal")
    public Map<String, String> goal(@RequestBody Map<String, String> request) {
        String goal = request.getOrDefault("goal", "communication");

        return Map.of(
            "status", "success",
            "goal", goal
        );
    }

    // Hoàn thành bài học
    @PostMapping("/lesson/complete")
    public Map<String, Object> completeLesson() {

        int xp = 20;

        return Map.of(
            "status", "success",
            "message", "Bạn đã hoàn thành bài học!",
            "xpEarned", xp,
            "hearts", 5,
            "streak", 1
        );
    }


}