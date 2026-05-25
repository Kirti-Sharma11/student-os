type Props = {
  title: string;
  value: string;
};

const StatsCard = ({ title, value }: Props) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition">

      <h3 className="text-zinc-400 text-sm mb-2">
        {title}
      </h3>

      <p className="text-3xl font-bold text-white">
        {value}
      </p>

    </div>
  );
};

export default StatsCard;