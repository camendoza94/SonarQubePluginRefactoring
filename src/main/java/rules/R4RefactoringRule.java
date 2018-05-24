package rules;

import org.sonar.check.Rule;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;

@Rule(key = "R4RefactoringRule")
public class R4RefactoringRule extends RefactoringRule {

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        setId(4);
        super.visitTrivia(syntaxTrivia);
    }
}
