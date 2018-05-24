package rules;

import com.google.common.collect.ImmutableList;
import org.sonar.check.Rule;
import org.sonar.plugins.java.api.IssuableSubscriptionVisitor;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;
import org.sonar.plugins.java.api.tree.Tree.Kind;

import java.util.List;

@Rule(key = "RefactoringRule")
public class RefactoringRule extends IssuableSubscriptionVisitor {

    int Id = 1;

    @Override
    public List<Kind> nodesToVisit() {
        return ImmutableList.of(Kind.TRIVIA);
    }

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        super.visitTrivia(syntaxTrivia);
        String comment = syntaxTrivia.comment();
        if (comment.contains("TODO R" + this.Id + ":")) {
            addIssue(syntaxTrivia.startLine(), "Architectural bad smell");
        }

    }

    synchronized void setId(int i) {
        this.Id = i;
    }
}
