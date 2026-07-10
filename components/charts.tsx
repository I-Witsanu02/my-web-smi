"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { growthRecords, roiImportance, sampleCase } from "@/lib/mock-data";

export function GrowthTrendChart() {
  const data = growthRecords.map((record) => ({
    age: record.ageYears,
    height: record.heightCm,
    expected: 106 + record.ageYears * 3.7
  }));

  return (
    <Card>
      <CardHeader title="Growth Trends" eyebrow="Multi-year comparison" />
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d3e4fe" />
            <XAxis dataKey="age" label={{ value: "Age", position: "insideBottom", offset: -4 }} />
            <YAxis domain={[100, 150]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="height" name="Patient height" stroke="#006971" strokeWidth={3} />
            <Line type="monotone" dataKey="expected" name="Reference trajectory" stroke="#74777f" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BoneAgeComparisonChart() {
  const data = [
    { label: "Chronological age", months: 120 },
    { label: "Predicted bone age", months: 116 }
  ];

  return (
    <Card>
      <CardHeader title="Chronological Age vs Bone Age" eyebrow={`Case ${sampleCase.id}`} />
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d3e4fe" />
            <XAxis dataKey="label" />
            <YAxis label={{ value: "Months", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="months" fill="#006971" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RoiImportanceChart() {
  return (
    <Card>
      <CardHeader title="ROI Importance" eyebrow="Relative contribution" />
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={roiImportance} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d3e4fe" />
            <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <YAxis dataKey="roi" type="category" width={64} />
            <Tooltip formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <Bar dataKey="importance" fill="#002046" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
