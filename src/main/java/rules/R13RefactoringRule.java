package rules;

import org.sonar.check.Rule;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;

@Rule(key = "R13RefactoringRule")
public class R13RefactoringRule extends RefactoringRule {

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        setId(13);
        super.visitTrivia(syntaxTrivia);
    }
}
