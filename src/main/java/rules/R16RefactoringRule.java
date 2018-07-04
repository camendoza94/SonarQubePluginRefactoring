package rules;

import org.sonar.check.Rule;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;

@Rule(key = "R16RefactoringRule")
public class R16RefactoringRule extends RefactoringRule {

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        setId(16);
        super.visitTrivia(syntaxTrivia);
    }
}
