import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Phase10LiveTimeline() {
  const overdueThreshold = 1;
  const [timelineData, setTimelineData] = useState({
    labels: ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],
    datasets: [
      { label: 'Completed', data: Array(7).fill(0), backgroundColor: Array(7).fill('#3b82f6'), tasks: Array(7).fill([]) },
      { label: 'Remaining', data: Array(7).fill(0), backgroundColor: Array(7).fill('#d1d5db'), tasks: Array(7).fill([]) },
    ]
  });

  const [overdueCount, setOverdueCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [slackNotify, setSlackNotify] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const tasks = await res.json();

      const completedCounts = Array(7).fill(0);
      const remainingCounts = Array(7).fill(0);
      const completedTasks = Array(7).fill([]);
      const remainingTasks = Array(7).fill([]);
      const today = new Date();
      let totalOverdue = 0;

      tasks.forEach(task => {
        const dayIndex = task.day || 0;
        const isOverdue = task.due && !task.completed && new Date(task.due) < today;

        if(task.completed){
          completedCounts[dayIndex]++;
          completedTasks[dayIndex] = [...completedTasks[dayIndex], `${task.name} (${task.assignee})`];
        } else {
          remainingCounts[dayIndex]++;
          remainingTasks[dayIndex] = [...remainingTasks[dayIndex], `${task.name} (${task.assignee})${isOverdue?' ⚠️ Overdue':''}`];
          if(isOverdue) totalOverdue++;
        }
      });

      const completedColors = completedCounts.map(c => c > 0 ? '#3b82f6' : '#60a5fa');
      const remainingColors = remainingCounts.map((r,i) => remainingTasks[i].some(t => t.includes('⚠️ Overdue')) ? '#f87171' : '#d1d5db');

      setTimelineData({
        labels: timelineData.labels,
        datasets: [
          { ...timelineData.datasets[0], data: completedCounts, backgroundColor: completedColors, tasks: completedTasks },
          { ...timelineData.datasets[1], data: remainingCounts, backgroundColor: remainingColors, tasks: remainingTasks }
        ]
      });

      setOverdueCount(totalOverdue);
      setShowAlert(totalOverdue >= overdueThreshold);

      if(totalOverdue >= overdueThreshold){
        if(emailNotify) await fetch('/api/sendOverdueEmail',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({count:totalOverdue})});
        if(slackNotify) await fetch('/api/sendSlackAlert',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({count:totalOverdue})});
      }

    } catch(err){
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(()=>{
    fetchTasks();
    const interval = setInterval(fetchTasks,60000);
    return ()=>clearInterval(interval);
  },[emailNotify,slackNotify]);

  const options = {
    responsive:true,
    plugins:{
      legend:{position:'bottom'},
      tooltip:{callbacks:{
        label:function(context){
          const dataset=context.dataset;
          const dayIndex=context.dataIndex;
          const taskList=dataset.tasks[dayIndex];
          return taskList.length ? taskList : `${dataset.label}: ${dataset.data[dayIndex]}`;
        }
      }}
    },
    scales:{y:{beginAtZero:true,stacked:true},x:{stacked:true}}
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={emailNotify} onChange={()=>setEmailNotify(!emailNotify)} />
          Email Notifications
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={slackNotify} onChange={()=>setSlackNotify(!slackNotify)} />
          Slack Notifications
        </label>
      </div>
      {showAlert && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded shadow">
          ⚠️ {overdueCount} tasks are overdue! Please review immediately.
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">A.I CRM Live Timeline with Alerts</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <Bar data={timelineData} options={options} />
      </div>
    </section>
  );
}
