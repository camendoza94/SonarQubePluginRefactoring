package rules;

import com.google.common.collect.ImmutableList;
import org.sonar.plugins.java.api.JavaCheck;

import java.util.List;

public final class RulesList {

    public RulesList() {
    }

    static List<Class> getChecks() {
        return ImmutableList.<Class>builder().addAll(getJavaChecks()).addAll(getJavaTestChecks()).build();
    }

    static List<Class<? extends JavaCheck>> getJavaChecks() {
        return ImmutableList.<Class<? extends JavaCheck>>builder()
                .add(R1RefactoringRule.class)
                .add(R2RefactoringRule.class)
                .add(R3RefactoringRule.class)
                .add(R4RefactoringRule.class)
                .add(R5RefactoringRule.class)
                .add(R6RefactoringRule.class)
                .add(R7RefactoringRule.class)
                .add(R8RefactoringRule.class)
                .add(R9RefactoringRule.class)
                .add(R10RefactoringRule.class)
                .add(R11RefactoringRule.class)
                .add(R12RefactoringRule.class)
                .add(R13RefactoringRule.class)
                .add(R14RefactoringRule.class)
                .add(R15RefactoringRule.class)
                .build();
    }

    static List<Class<? extends JavaCheck>> getJavaTestChecks() {
        return ImmutableList.<Class<? extends JavaCheck>>builder()
                .build();
    }
}