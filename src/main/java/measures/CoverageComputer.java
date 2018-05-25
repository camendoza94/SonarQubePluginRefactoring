package measures;

import org.sonar.api.ce.measure.Issue;
import org.sonar.api.ce.measure.Measure;
import org.sonar.api.ce.measure.MeasureComputer;

import java.util.List;

import static measures.CoverageMetrics.ARCHITECTURAL_BAD_SMELLS;
import static org.sonar.api.ce.measure.Component.Type.FILE;

public class CoverageComputer implements MeasureComputer {
    @Override
    public MeasureComputerDefinition define(MeasureComputerDefinitionContext defContext) {
        return defContext.newDefinitionBuilder()
                .setOutputMetrics(ARCHITECTURAL_BAD_SMELLS.key())
                .build();
    }


    @Override
    public void compute(MeasureComputerContext context) {
        if (context.getComponent().getType() == FILE) {
            List<? extends Issue> fileIssues = context.getIssues();
            int sum = 0;
            for (Issue i : fileIssues) {
                if (i.key().contains("RefactoringRule")) {
                    System.out.println(i.key());
                    sum++;
                }
            }
            context.addMeasure(ARCHITECTURAL_BAD_SMELLS.key(), sum);
            return;
        }
        int totalSum = 0;
        for (Measure measure : context.getChildrenMeasures(ARCHITECTURAL_BAD_SMELLS.key())) {
            totalSum += measure.getIntValue();
        }

        context.addMeasure(ARCHITECTURAL_BAD_SMELLS.key(), totalSum);
    }
}