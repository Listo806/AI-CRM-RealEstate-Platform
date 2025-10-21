// Phase10LiveTimelineWithAlerts.jsx
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Phase10LiveTimelineWithAlerts() {
  const apiKey = "bb09cc747c3cf588c66d98bafb7f6bf4"; // Your Asana token
  const boardId = "1211701959618456"; // Your Asana Project ID
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
      const res = await axios.get(
        `https://app.asana.com/api/1.0/projects/${boardId}/tasks`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const tasks = res.data.data.map(task => ({
        day: parseInt(task.name.match(/Day (\d)/)?.[1] || 1, 10) - 1,
        completed: task.completed,
        name: task.name,
        assignee: task.assignee?.name || 'Unassigned',
        due: task.due_on ? new Date(task.due_on) : null
      }));

      const completedCounts = Array(7).fill(0);
      const remainingCounts = Array(7).fill(0);
      const completedTasks = Array(7).fill([]);
      const remainingTasks = Array(7).fill([]);
      const today = new Date();
      let totalOverdue = 0;

      tasks.forEach(task => {
        const isOverdue = task.due && !task.completed && task.due < today;
        if(task.completed){
          completedCounts[task.day]++;
          completedTasks[task.day] = [...completedTasks[task.day], `${task.name} (${task.assignee})`];
        } else {
          remainingCounts[task.day]++;
          remainingTasks[task.day] = [...remainingTasks[task.day], `${task.name} (${task.assignee})${isOverdue?' ⚠️ Overdue':''}`];
          if(isOverdue) totalOverdue++;
        }
      });

      const completedColors = completedCounts.map(c => c>0 ? '#3b82f6' : '#60a5fa');
      const remainingColors = remainingCounts.map((r,i) => remainingTasks[i].some(t=>t.includes('⚠️ Overdue')) ? '#f87171' : '#d1d5db');

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
        if(emailNotify){
          fetch('/api/sendOverdueEmail', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({count:totalOverdue, recipients:['team@example.com']})
          });
        }
        if(slackNotify){
          fetch('/api/sendSlackAlert', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({count:totalOverdue, webhookUrl:process.env.SLACK_WEBHOOK})
          });
        }
      }

    } catch(err){
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(()=>{
    fetchTasks();
    const interval = setInterval(fetchTasks, 60000);
    return ()=>clearInterval(interval);
  }, [emailNotify, slackNotify]);

  const options = {
    responsive:true,
    plugins:{
      legend:{position:'bottom'},
      tooltip:{callbacks:{
        label:function(context){
          const dataset = context.dataset;
          const dayIndex = context.dataIndex;
          const taskList = dataset.tasks[dayIndex];
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
      {showAlert && <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded shadow">
        ⚠️ {overdueCount} tasks are overdue! Please review immediately.
      </div>}
      <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">A.I CRM Live Timeline with Alerts</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <Bar data={timelineData} options={options} />
      </div>
    </section>
  );
}

