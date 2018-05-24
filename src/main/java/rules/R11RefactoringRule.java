package rules;

import org.sonar.check.Rule;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;

@Rule(key = "R11RefactoringRule")
public class R11RefactoringRule extends RefactoringRule {

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        setId(11);
        super.visitTrivia(syntaxTrivia);
    }
}
