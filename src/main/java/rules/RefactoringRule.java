package rules;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import io.github.cdimascio.dotenv.Dotenv;
import org.eclipse.egit.github.core.Issue;
import org.eclipse.egit.github.core.RepositoryId;
import org.eclipse.egit.github.core.service.IssueService;
import org.sonar.check.Rule;
import org.sonar.plugins.java.api.IssuableSubscriptionVisitor;
import org.sonar.plugins.java.api.tree.SyntaxTrivia;
import org.sonar.plugins.java.api.tree.Tree.Kind;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Properties;

import static rules.JavaRulesDefinition.RESOURCE_BASE_PATH;
import static rules.JavaRulesDefinition.readResource;

@Rule(key = "RefactoringRule")
public class RefactoringRule extends IssuableSubscriptionVisitor {

    private static final String TOKEN = "GITHUB_OAUTH_TOKEN";
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
                    .put(16, "Add missing check for nullity and WebApplicationException.")
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
            addIssueOnGithub();
        }

    }

    private void addIssueOnGithub() {
        String userName;
        String repoName;
        try {
            FileInputStream input = new FileInputStream("./app.properties");
            Properties prop = new Properties();
            prop.load(input);
            userName = prop.getProperty("userName");
            repoName = prop.getProperty("repoName");
            IssueService service = new IssueService();
            Dotenv dotenv = Dotenv.configure()
                    .directory("./.env")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
            service.getClient().setOAuth2Token(dotenv.get(TOKEN));
            RepositoryId repo = new RepositoryId(userName, repoName);
            List<Issue> issues = service.getIssues(repo, null);
            String title = TITLES.get(this.Id) + " - " + context.getFile().getParentFile().getName()
                    + "/" + context.getFile().getName();
            for (Issue i : issues) {
                if (i.getTitle().equals(title))
                    return;
            }
            Issue issue = new Issue();
            issue.setTitle(title);
            URL resource = RefactoringRule.class.getResource(RESOURCE_BASE_PATH + "/" + "R" + this.Id
                    + "RefactoringRule" + "_java.html");
            if (resource != null) {
                issue.setBody(readResource(resource));
            }
            service.createIssue(repo, issue);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    synchronized void setId(int i) {
        this.Id = i;
    }
}
