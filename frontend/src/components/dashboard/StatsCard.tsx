type Props = {
  title: string;
  value: string | number;
};

const StatsCard = ({ title, value }: Props) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

      <h2 className="text-zinc-400 text-sm">
        {title}
      </h2>

      <p className="text-3xl font-bold text-white mt-3">
        {value}
      </p>

    </div>
  );
};

export default StatsCard;