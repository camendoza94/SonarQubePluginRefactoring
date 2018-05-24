package rules;

import org.sonar.check.Rule;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;

@Rule(key = "R10RefactoringRule")
public class R10RefactoringRule extends RefactoringRule {

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        setId(10);
        super.visitTrivia(syntaxTrivia);
    }
}
