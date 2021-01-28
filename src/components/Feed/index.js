import React from "react";
import { Media, Row, Col, Card, Spinner } from "react-bootstrap";
import CommentList from "../CommentList";
import AddComment from "../AddComment";
import ModalEditPost from "../ModalEditPost";
import { fetchPosts } from "../../api/posts";
import { getLocalStorage } from "../../helpers/localStorage";

class Feed extends React.Component {
	state = {
		posts: [],
		// like: localStorage.getItem("likes").split(","),
		like:
			localStorage.getItem("likes") &&
			localStorage.getItem("likes").length > 0
				? localStorage.getItem("likes").split(",")
				: // localStorage.getItem("likes")
				  " ",
		comments: [],
		loading: true,
		userName: getLocalStorage("user").username,
		show: false,
		post: {},
		submitCounter: 0,

		submittedSize: 0,
		fetchComment: false,
		showComment: false,
		addComment: {
			comment: "",
			postId: "",
			userId: getLocalStorage("user")._id,
		},
	};

	componentDidUpdate = (previousProps) => {
		if (previousProps.feedCounter !== this.props.feedCounter) {
			this.populateFeed();
		}
	};

	componentDidMount = () => {
		this.populateFeed();
	};

	handleLikes = (id) => {
		let likes = [];
		if (this.state.like.includes(id)) {
			likes = this.state.like.filter((el) => el !== id);
			this.setState({
				like: likes,
			});
		} else {
			likes = [...this.state.like, id];
			this.setState({ like: likes });
		}

		localStorage.setItem("likes", likes);
	};

	handleComments = (id) => {
		this.setState({
			showComment: !this.state.showComment,
			fetchComment: true,
		});
		if (this.state.comments.includes(id)) {
			this.setState({
				comments: this.state.comments.filter((el) => el !== id),
			});
		} else {
			this.setState({ comments: [...this.state.comments, id] });
		}
	};

	populateFeed = async () => {
		const posts = await fetchPosts();
		console.log(posts.data);
		if (posts.data.length > 0) {
			this.setState({ posts: posts.data.reverse(), loading: false });
		}
	};

	updateCommentField = (e, postId) => {
		console.log("e: ", e);
		console.log("pstID: ", postId);
		if (e.keyCode === 13 || e.key === "Enter") {
			e.preventDefault();
			this.submitComment(postId);
		} else {
			let addComment = { ...this.state.addComment };
			let currentId = e.currentTarget.name;

			addComment[currentId] = e.currentTarget.value;

			this.setState({ addComment });
		}
	};

	submitComment = async (postId) => {
		// e.preventDefault();

		try {
			let response = await fetch(
				`${process.env.REACT_APP_BE_URL}/posts/${postId}/comments/`,
				{
					method: "POST",
					body: JSON.stringify(this.state.addComment),
					headers: new Headers({
						"Content-Type": "application/json",
					}),
				}
			);

			if (response.ok) {
				// alert("Comment saved!");
				this.setState({
					addComment: {
						comment: "",
						postId: postId,
						userId: getLocalStorage("user")._id,
					},
					errMessage: "",
					submittedSize: this.state.submittedSize + 1,
				});
			} else {
				alert("something went wrong");
				let error = await response.json();
			}
		} catch (e) {
			alert("something went wrong");
			console.log(e); // Error
		}
	};
	render() {
		return (
			<>
				{this.state.loading ? (
					<Spinner
						animation='border'
						variant='primary'
						style={{ marginLeft: "45%" }}
					/>
				) : (
					<Row>
						{this.state.posts.map((post, index) => (
							<Col md={12} className='my-1' key={index}>
								<Card className='p-4 postProfile'>
									<Row>
										<Col xs={11}>
											<Media className='p-1'>
												<img
													width={64}
													height={64}
													className='mr-3'
													src={post?.user?.image}
													alt='user'
													style={{
														borderRadius: "50%",
														objectFit: "cover",
													}}
													onClick={() =>
														this.props.history.push(
															"/profile/" +
																post?.user?._id
														)
													}
												/>
												<Media.Body>
													<h5
														onClick={() =>
															this.props.history.push(
																"/profile/" +
																	post?.user
																		?._id
															)
														}>
														{post?.username}
													</h5>
													<h6
														style={{
															color: "#b0b0b0",
															fontSize: "15px",
														}}>
														{post?.user?.name +
															" " +
															post?.user?.surname}
													</h6>
													<h6
														style={{
															color: "#b0b0b0",
															fontSize: "15px",
														}}>
														{post.createdAt}
														<i
															className='fas fa-globe-americas ml-1'
															style={{
																color:
																	"#6c6c6c",
															}}></i>
													</h6>
												</Media.Body>
											</Media>
										</Col>
										<Col xs={1}>
											<i
												className='fas fa-ellipsis-h p-1'
												style={{
													color: "#404040",
													display:
														post.username ===
														this.state.userName
															? "inline"
															: "none",
												}}
												onClick={() =>
													this.setState({
														post: post,
														show: true,
													})
												}></i>
										</Col>
									</Row>
									<div className='border-bottom pb-4'>
										<p className='pt-3 pb-4 px-1'>
											{post.text}
											<br />
										</p>
										{post.image && (
											<img
												src={post.image}
												className='img-fluid '
												style={{
													objectFit: "cover",
													maxHeight: "300px",
													width: "100%",
													borderColor: "#e7e6e5",
												}}
											/>
										)}
										<br />
										<i
											className='far fa-thumbs-up mt-2 p-2'
											style={{
												color: "#0a66c2",
												background: "#aacdf0",
												borderRadius: "50%",
												display: this.state.like.includes(
													post._id
												)
													? "inline-block"
													: "none",
											}}></i>
									</div>

									<div
										className='d-flex  mt-3 posts '
										style={{ color: "#6c6c6c" }}>
										<span
											className='px-3'
											onClick={() =>
												this.handleLikes(post._id)
											}>
											<i className='far fa-thumbs-up'></i>{" "}
											{this.state.like.includes(post._id)
												? "Unlike"
												: "Like"}
										</span>
										<span
											className='px-3'
											onClick={() =>
												this.handleComments(post._id)
											}>
											<i className='far fa-comment-dots'></i>{" "}
											Comment
										</span>
										<span className='px-3'>
											<i className='fas fa-share-square'></i>{" "}
											Share
										</span>
										<span className='px-3'>
											<i className='fas fa-paper-plane'></i>{" "}
											Send
										</span>
									</div>
									<div
										style={{
											display: this.state.comments.includes(
												post._id
											)
												? "block"
												: "none",
										}}>
										<div
											className={
												this.state.showComment
													? "d-block"
													: "d-none"
											}>
											<AddComment
												addComment={
													this.state.addComment
												}
												onChangeElement={(e, postId) =>
													this.updateCommentField(
														e,
														post._id
													)
												}
												postId={post._id}
											/>
										</div>
										<div>
											<CommentList
												fetchComment={
													this.state.fetchComment
												}
												submittedSize={
													this.state.submittedSize
												}
												postId={post._id}
											/>
										</div>
									</div>
								</Card>
							</Col>
						))}
					</Row>
				)}
				<ModalEditPost
					post={this.state.post}
					show={this.state.show}
					onHide={() => this.setState({ show: false })}
					feedCounter={this.props.changeCounter}
				/>
			</>
		);
	}
}

export default Feed;
