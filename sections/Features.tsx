import { Feature } from "@/components/Feature";

const features = [
  {
    title: "Умение слушать и слышать",
    description:
      "Хороший игрок должен уметь анализировать большинство речей сказанных за столом, но также это и помогает в жизни. Сколько людей вы сможете расположить к себе только благодаря этому умению.",
  },
  {
    title: "Умение отстаивать своё мнение",
    description:
      "Зачастую в жизни может складывается так, что вас не слышат, не учитывают ваши мысли и это в какой то мере колеблет ваше внутреннее состояние. Мафия учит тому, что свои мысли можно и нужно высказывать и обучает выражать их грамотно.",
  },
  {
    title: "Внимательность",
    description:
      "Мафия отрабатывает в человеке это свойство. Сколько нужно успеть уловить за игровым столом различных коммуникацией, «маяков» и оговорок, красота.",
  },
];

export const Features = () => {
  return (
    <section className=" py-[72px] md:py-24">
      <div className="container">
        <h2 className="text-center font-bold text-5xl md:text-6xl tracking-tighter">В чем прелесть мафии?</h2>
        <div className="max-w-xl mx-auto">
          <p className="text-center mt-5 text-xl ">Помимо новых знакомств и улучшения коммуникативности, мафия предлагает ещё несколько интересных умений</p>
        </div>
        <div className="mt-16 flex flex-col md:flex-row gap-4">
          {features.map(({ title, description }) => (
            <Feature key={title} title={title} description={description} />
          ))}
        </div>
      </div>
    </section>
  );
};
