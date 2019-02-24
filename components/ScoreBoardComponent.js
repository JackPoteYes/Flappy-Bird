function ScoreBoardComponent(props) {
  console.log("Hello");
  return (
    <table>
      <thead>
        <tr>
          <th>Score</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {props.scores &&
          props.scores.map(scoreItem => (
            <ScoreComponent key={scoreItem.id} item={scoreItem} />
          ))}
      </tbody>
    </table>
  );
}
