import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const chartMetricOptions = [
  { value: "income", label: "Income" },
  { value: "expenses", label: "Expenses" },
  { value: "profit", label: "Profit" },
  { value: "students", label: "Students" },
];

const chartStyleOptions = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
];

const periodLabels = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const studentSliceColors = ["#4f8cff", "#35c58c", "#f59e0b"];

const formatChartTick = (value) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value;
};

const getMetricLabel = (value) => chartMetricOptions.find((option) => option.value === value)?.label || "Value";

const toChartNumber = (value) => Number(value || 0);

const AnalyticsSection = ({ overview }) => {
  const [metric, setMetric] = useState("income");
  const [style, setStyle] = useState("bar");

  const periodData = useMemo(() => {
    const trends = Array.isArray(overview?.trends) ? overview.trends : [];

    if (trends.length) {
      return trends.map((item, index) => {
        const income = toChartNumber(item.income);
        const expenses = toChartNumber(item.expenses);

        return {
          period: item.period || item.label || `Period ${index + 1}`,
          income,
          expenses,
          profit: item.profit === undefined ? income - expenses : toChartNumber(item.profit),
        };
      });
    }

    return periodLabels.map(({ key, label }) => ({
      period: label,
      income: toChartNumber(overview?.[key]?.income),
      expenses: toChartNumber(overview?.[key]?.expenses),
      profit: toChartNumber(overview?.[key]?.profit),
    }));
  }, [overview]);

  const studentData = useMemo(
    () => [
      { name: "Active", value: toChartNumber(overview?.students?.active) },
      { name: "Inactive", value: toChartNumber(overview?.students?.inactive) },
    ],
    [overview],
  );

  const isStudentMetric = metric === "students";
  const totalStudents = toChartNumber(overview?.students?.total);
  const visibleStudentSlices = studentData.filter((item) => item.value > 0);
  const hasChartData = isStudentMetric
    ? visibleStudentSlices.length > 0
    : periodData.some((item) => Math.abs(toChartNumber(item[metric])) > 0);

  const chartColor = metric === "expenses" ? "#f87171" : metric === "profit" ? "#34d399" : "#4f8cff";
  const metricLabel = getMetricLabel(metric);

  return (
    <Card className="panel-card analytics-card">
      <Card.Body>
        <div className="analytics-heading">
          <div>
            <h3>Insights Graph</h3>
            <p>Visualize students and finance trends by period.</p>
          </div>
          <div className="analytics-controls">
            <Form.Select
              value={metric}
              onChange={(event) => setMetric(event.target.value)}
              aria-label="Select chart metric"
            >
              {chartMetricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>

            {!isStudentMetric ? (
              <Form.Select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                aria-label="Select chart style"
              >
                {chartStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            ) : null}
          </div>
        </div>

        <div className="analytics-chart-shell">
          {!hasChartData ? (
            <div className="analytics-empty-state">
              <strong>No {metricLabel.toLowerCase()} data yet</strong>
              <span>Recorded totals will appear here automatically.</span>
            </div>
          ) : isStudentMetric ? (
            <div className="students-chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={visibleStudentSlices} dataKey="value" nameKey="name" innerRadius={62} outerRadius={94}>
                    {visibleStudentSlices.map((slice, index) => (
                      <Cell key={slice.name} fill={studentSliceColors[index % studentSliceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, "Students"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="students-chart-legend">
                {studentData.map((item, index) => (
                  <div key={item.name}>
                    <span style={{ background: studentSliceColors[index % studentSliceColors.length] }} />
                    <strong>{item.name}</strong>
                    <small>{item.value}</small>
                  </div>
                ))}
              </div>
              <p className="students-total-caption">Total Students: {totalStudents}</p>
            </div>
          ) : style === "line" ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodData} margin={{ left: 4, right: 12, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(145, 160, 195, 0.22)" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatChartTick} tickLine={false} axisLine={false} width={70} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value || 0)), metricLabel]}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: chartColor }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodData} margin={{ left: 4, right: 12, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(145, 160, 195, 0.22)" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatChartTick} tickLine={false} axisLine={false} width={70} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value || 0)), metricLabel]}
                />
                <Bar dataKey={metric} fill={chartColor} radius={[8, 8, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnalyticsSection;
