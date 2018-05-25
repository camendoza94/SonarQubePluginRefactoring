package rules;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.sonar.check.Rule;
import org.sonar.plugins.java.api.IssuableSubscriptionVisitor;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;
import org.sonar.plugins.java.api.tree.Tree.Kind;

import java.util.List;

@Rule(key = "RefactoringRule")
public class RefactoringRule extends IssuableSubscriptionVisitor {

    private int Id;
    private static final ImmutableMap<Integer, String> TITLES =
            new ImmutableMap.Builder<Integer, String>()
                    .put(1, "Implement Serializable in this DTO.")
                    .put(2, "Add empty constructor for serializing.")
                    .put(3, "Remove or edit no-serializable fields.")
                    .put(4, "Add missing getter or setter.")
                    .put(5, "Check constructor from Entity implementation in DTO.")
                    .put(6, "Check toEntity implementation in DTO.")
                    .put(7, "Remove fields that are not of type DTO or List.")
                    .put(8, "Check constructor from Entity implementation in DetailDTO.")
                    .put(9, "Check toEntity implementation in DetailDTO.")
                    .put(10, "Add missing Path annotation on Resource.")
                    .put(11, "Add missing Consumes annotation on Resource.")
                    .put(12, "Add missing Produces annotation on Resource.")
                    .put(13, "Add missing logic injection on Resource.")
                    .put(14, "Add missing Stateless annotation on Logic.")
                    .put(15, "Add missing persistence injection on Logic.")
                    .build();

    @Override
    public List<Kind> nodesToVisit() {
        return ImmutableList.of(Kind.TRIVIA);
    }

    @Override
    public void visitTrivia(SyntaxTrivia syntaxTrivia) {
        super.visitTrivia(syntaxTrivia);
        String comment = syntaxTrivia.comment();
        if (comment.contains("TODO R" + this.Id + ":")) {
            addIssue(syntaxTrivia.startLine(), TITLES.get(this.Id));
        }

    }

    synchronized void setId(int i) {
        this.Id = i;
    }
}
