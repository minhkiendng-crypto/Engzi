package com.lingora;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/placement")
public class PlacementController {

    private final PlacementQuestionService questionService;

    public PlacementController(PlacementQuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/test")
    public Map<String, Object> getTest(
            @RequestParam(defaultValue = "30") int amount) {

        // Placement test của Engzi luôn có đúng 30 câu.
        amount = 30;

        if (questionService.getQuestionBankSize() < amount) {
            amount = questionService.getQuestionBankSize();
        }

        List<PlacementQuestion> questions =
                questionService.getRandomQuestions(amount);

        return Map.of(
                "status", "success",
                "amount", questions.size(),
                "questions", questions
        );
    }

    @GetMapping("/info")
    public Map<String, Object> getInfo() {

        return Map.of(
                "status", "success",
                "questionBankSize",
                questionService.getQuestionBankSize(),
                "targetTests", 1,
                "questionsPerTest", 30,
                "targetQuestions", 30
        );
    }
}