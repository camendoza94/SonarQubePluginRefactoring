import org.junit.Test;
import org.sonar.java.checks.verifier.JavaCheckVerifier;
import rules.RefactoringRule;

public class RefactoringTest {
    @Test
    public void test() {
        JavaCheckVerifier.verify("src/main/java/rules/Refactoring.java", new RefactoringRule());
    }
}
